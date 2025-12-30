using kiedygramy.DTO.Game;
using System.Xml.Linq;
using System.Net.Http;
using System.Threading;

namespace kiedygramy.Services.External
{
    public class BoardGameGeekClientService : IBoardGameGeekClientService
    {
        private readonly HttpClient _httpClient;

        public BoardGameGeekClientService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<IEnumerable<ExternalGameResponse>> SearchGamesAsync(string query, int skip = 0, int take = 10, CancellationToken cancellationToken = default)
        {

            if (string.IsNullOrWhiteSpace(query) || query.Length < 3)
                return Enumerable.Empty<ExternalGameResponse>();
            

            var encodedQuery = Uri.EscapeDataString(query);
            var searchUrl = $"search?query={encodedQuery}&type=boardgame";

            var searchXml = await _httpClient.GetStringAsync(searchUrl, cancellationToken);
            var searchDoc = XDocument.Parse(searchXml);

            var allItems = searchDoc.Descendants("item");

            var pagedItems = allItems
                .Skip(skip)
                .Take(take)
                .ToList();

            if (!pagedItems.Any())
                return Enumerable.Empty<ExternalGameResponse>();
            
            var ids = pagedItems
                .Select(i => i.Attribute("id")?.Value)
                .Where(id => !string.IsNullOrWhiteSpace(id))
                .ToList();

            var idsString = string.Join(",", ids);

            var detailsUrl = $"https://boardgamegeek.com/xmlapi2/thing?id={idsString}";
            var detailsXml = await _httpClient.GetStringAsync(detailsUrl, cancellationToken);
       
            var detailsDoc = XDocument.Parse(detailsXml);

            var result = new List<ExternalGameResponse>();

            foreach (var item in detailsDoc.Descendants("item"))
            {
                cancellationToken.ThrowIfCancellationRequested();

                var title = item
                    .Descendants("name")
                    .FirstOrDefault(n => n.Attribute("type")?.Value == "primary")?
                    .Attribute("value")?.Value ?? "Unknown";

                var image = item.Element("image")?.Value;

                var minPlayers = int.TryParse(
                    item.Element("minplayers")?.Attribute("value")?.Value,
                    out var min
                ) ? min : 0;

                var maxPlayers = int.TryParse(
                    item.Element("maxplayers")?.Attribute("value")?.Value,
                    out var max
                ) ? max : 0;

                var playingTime = item.Element("playingtime")?.Attribute("value")?.Value;
                var playtimeString = playingTime != null ? $"{playingTime} min" : null;

                var genres = item
                    .Descendants("link")
                    .Where(l => l.Attribute("type")?.Value == "boardgamecategory")
                    .Select(l => l.Attribute("value")?.Value!)
                    .Where(v => !string.IsNullOrWhiteSpace(v))
                    .Take(5)
                    .ToList();

                var genreString = string.Join(", ", genres);
                var bggId = item.Attribute("id")?.Value ?? "";

                result.Add(new ExternalGameResponse(
                    Title: title,
                    Genres: genres,
                    ImageUrl: image,
                    PlayTime: playtimeString,
                    MinPlayers: minPlayers,
                    MaxPlayers: maxPlayers,
                    SourceId: bggId
                ));
            }

            return result;
        }

        public async Task<ExternalGameResponse?> GetGameByIdAsync(string sourceId, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(sourceId))
                return null;

            var url = $"https://boardgamegeek.com/xmlapi2/thing?id={sourceId}";
            var xml = await _httpClient.GetStringAsync(url, cancellationToken);

            var doc = XDocument.Parse(xml);

            var item = doc.Descendants("item").FirstOrDefault();
            if (item is null)
                return null;

            var title = item
                .Descendants("name")
                .FirstOrDefault(n => n.Attribute("type")?.Value == "primary")?
                .Attribute("value")?.Value ?? "Unknown";

            var image = item.Element("image")?.Value;

            var minPlayers = int.TryParse(item.Element("minplayers")?.Attribute("value")?.Value, out var min) ? min : 0;
            var maxPlayers = int.TryParse(item.Element("maxplayers")?.Attribute("value")?.Value, out var max) ? max : 0;

            var playingTime = item.Element("playingtime")?.Attribute("value")?.Value;
            var playtimeString = playingTime != null ? $"{playingTime} min" : null;

            var genres = item
                .Descendants("link")
                .Where(l => l.Attribute("type")?.Value == "boardgamecategory")
                .Select(l => l.Attribute("value")?.Value!)
                .Where(v => !string.IsNullOrWhiteSpace(v))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            return new ExternalGameResponse(
                Title: title,
                Genres: genres,
                ImageUrl: image,
                PlayTime: playtimeString,
                MinPlayers: minPlayers,
                MaxPlayers: maxPlayers,
                SourceId: sourceId
            );
        }



    }
}
