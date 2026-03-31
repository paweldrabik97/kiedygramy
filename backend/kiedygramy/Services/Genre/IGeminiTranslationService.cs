namespace kiedygramy.Services.Genre
{
    public interface IGeminiTranslationService
    {
        Task<Dictionary<string, string>?> TranslateGenreToMultipleLanguagesAsync(string englishGenre);
    }
}
