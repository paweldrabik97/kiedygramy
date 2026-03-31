
using System.Text;
using System.Text.Json;

namespace kiedygramy.Services.Genre
{
    public class GeminiTranslationService : IGeminiTranslationService
    {
        private readonly string _apiKey;
        private readonly HttpClient _httpClient;

        public GeminiTranslationService(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _apiKey = config["Gemini:ApiKey"] ?? throw new ArgumentNullException("Brak klucza Gemini API!");
        }

        public async Task<Dictionary<string, string>?> TranslateGenreToMultipleLanguagesAsync(string englishGenre)
        {
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={_apiKey}";


            var systemPrompt = @"You are an expert board game translator. Translate the board game genre/mechanic from English into Polish (pl), Spanish (es), and German (de).
                                IMPORTANT CONTEXT: These terms describe a 'board game' (gra planszowa, juego de mesa, Brettspiel). 
                                If the term is an adjective, adjust its gender to match the word 'game' in the target language (e.g., feminine in Polish like 'Ekonomiczna', masculine in Spanish like 'Económico'). In German, prefer compound nouns if natural (e.g., 'Wirtschaftsspiel').
                                Return ONLY a valid JSON object in this exact format:
                                {""pl"": ""..."", ""es"": ""..."", ""de"": ""...""}";

            var requestBody = new
            {
                system_instruction = new { parts = new[] { new { text = systemPrompt } } },
                contents = new[]
                {
                    new { parts = new[] { new { text = englishGenre } } }
                },
                generationConfig = new { responseMimeType = "application/json" }
            };

            var jsonContent = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

            try
            {
                var response = await _httpClient.PostAsync(url, jsonContent);

                if (!response.IsSuccessStatusCode)
                    return null;

                var jsonResponse = await response.Content.ReadAsStringAsync();
                using var document = JsonDocument.Parse(jsonResponse);

                var generatedJsonString = document.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString();

                if (string.IsNullOrWhiteSpace(generatedJsonString))
                    return null;

                var translations = JsonSerializer.Deserialize<Dictionary<string, string>>(generatedJsonString);

                return translations;
            }
            catch (Exception ex)
            {
                // Error handling (e.g., log the error)
                return null;
            }
        }
    }
}
