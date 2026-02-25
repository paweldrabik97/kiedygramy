using kiedygramy.Application.Errors;
using kiedygramy.Data;
using kiedygramy.Domain;
using kiedygramy.DTO.Common;
using kiedygramy.DTO.Game;
using kiedygramy.Services.External;
using Microsoft.EntityFrameworkCore;

namespace kiedygramy.Services.Games
{
    public class GameService : IGameService
    {
        private readonly AppDbContext _db;
        private readonly IBoardGameGeekClientService _bgg;

        public GameService(AppDbContext db, IBoardGameGeekClientService bgg)
        {
            _db = db;
            _bgg = bgg;
        }

        // 1. TWORZENIE GRY NIESTANDARDOWEJ (Całkowicie z palca przez użytkownika)
        public async Task<(Game? game, ErrorResponseDto? error)> CreateAsync(CreateGameRequest dto, int userId)
        {
            var title = dto.Title.Trim();

            // 1. Sprawdzamy, czy gra o takim tytule już istnieje w globalnej bazie
            var existingGame = await _db.Games
                .FirstOrDefaultAsync(g => g.Title.ToLower() == title.ToLower());

            Game gameToLink;

            if (existingGame is not null)
            {
                // Gra istnieje. Sprawdzamy, czy użytkownik ma ją w kolekcji.
                bool alreadyInCollection = await _db.UserGames
                    .AnyAsync(ug => ug.UserId == userId && ug.GameId == existingGame.Id);

                if (alreadyInCollection)
                    return (null, Errors.Game.DuplicateTitle());

                gameToLink = existingGame;
            }
            else
            {
                // Gry nie ma. Walidacja DTO.
                if (dto.MaxPlayers < dto.MinPlayers)
                    return (null, Errors.Game.MaxPlayersMustBeGreaterOrEqualMin());

                if (dto.MinPlayers <= 0)
                    return (null, Errors.Game.MinPlayersMustBeGreaterThanZero());

                var genreIds = (dto.GenreIds ?? new List<int>()).Distinct().ToList();

                var genres = await _db.Genres
                    .Where(g => genreIds.Contains(g.Id))
                    .ToListAsync();

                if (genres.Count != genreIds.Count)
                    return (null, Errors.General.Validation("Wybrano nieistniejącą kategorię.", "GenreIds"));

                // Tworzymy nową, NIESTANDARDOWĄ grę w globalnym katalogu
                gameToLink = new Game
                {
                    Title = title,
                    IsCustom = true,
                    CreatedById = userId,
                    GameGenres = genres.Select(g => new GameGenre { GenreId = g.Id }).ToList(),
                    MinPlayers = dto.MinPlayers,
                    MaxPlayers = dto.MaxPlayers,
                    ImageUrl = dto.ImageUrl,
                    PlayTime = dto.PlayTime
                };

                _db.Games.Add(gameToLink);
            }

            // Dodajemy do kolekcji (bez LocalTitle, bo gracz podał sam tytuł jako 'title')
            var userGame = new UserGame
            {
                UserId = userId,
                Game = gameToLink
            };

            _db.UserGames.Add(userGame);
            await _db.SaveChangesAsync();

            return (gameToLink, null);
        }

        // 2. EDYCJA (Zostawiłem tu Twoją logikę, ale pamiętaj - bez pola LocalTitle na razie pozwala na zmianę danych ogólnej gry)
        public async Task<ErrorResponseDto?> UpdateAsync(int gameId, UpdateGameRequest dto, int userId)
        {
            var userGame = await _db.UserGames
                .Include(ug => ug.Game).ThenInclude(g => g.GameGenres)
                .FirstOrDefaultAsync(ug => ug.UserId == userId && ug.GameId == gameId);

            if (userGame is null)
                return Errors.Game.NotFound();

            var game = userGame.Game;
            var title = dto.Title.Trim();

            bool exists = await _db.Games
                .AnyAsync(g => g.Title.ToLower() == title.ToLower() && g.Id != gameId);

            if (exists)
                return Errors.Game.DuplicateTitle();

            if (dto.MaxPlayers < dto.MinPlayers)
                return Errors.Game.MaxPlayersMustBeGreaterOrEqualMin();

            if (dto.MinPlayers <= 0)
                return Errors.Game.MinPlayersMustBeGreaterThanZero();

            var genreIds = (dto.GenreIds ?? new List<int>()).Distinct().ToList();

            var genres = await _db.Genres
                .Where(g => genreIds.Contains(g.Id))
                .ToListAsync();

            if (genres.Count != genreIds.Count)
                return Errors.General.Validation("Wybrano nieistniejącą kategorię.", "GenreIds");

            game.Title = title;
            game.GameGenres.Clear();

            foreach (var genre in genres)
            {
                game.GameGenres.Add(new GameGenre { GameId = game.Id, GenreId = genre.Id });
            }

            game.MinPlayers = dto.MinPlayers;
            game.MaxPlayers = dto.MaxPlayers;

            await _db.SaveChangesAsync();
            return null;
        }

        // 3. USUWANIE (Usuwamy tylko powiązanie z tabeli łączącej, chyba że gracz był autorem gry IsCustom)
        public async Task<ErrorResponseDto?> DeleteAsync(int gameId, int userId)
        {
            var userGame = await _db.UserGames
                .Include(ug => ug.Game)
                .FirstOrDefaultAsync(ug => ug.UserId == userId && ug.GameId == gameId);

            if (userGame is null)
                return Errors.Game.NotFound();

            _db.UserGames.Remove(userGame);

            // Dodatkowo: Jeśli to była "Prywatna gra", którą on stworzył, i on ją teraz usuwa z kolekcji, możemy ją usunąć całkowicie.
            if (userGame.Game.IsCustom && userGame.Game.CreatedById == userId)
            {
                _db.Games.Remove(userGame.Game);
            }

            await _db.SaveChangesAsync();
            return null;
        }

        // 4. POBIERANIE LISTY (Zwracamy LocalTitle jeśli istnieje, inaczej tytuł z globalnej tabeli)
        public async Task<IEnumerable<GameListItemResponse>> GetAllAsync(int userId)
        {
            return await _db.UserGames
                .AsNoTracking()
                .Where(ug => ug.UserId == userId)
                .Include(ug => ug.Game)
                    .ThenInclude(g => g.GameGenres)
                        .ThenInclude(gg => gg.Genre)
                .Select(ug => new GameListItemResponse(
                    ug.Game.Id,
                    ug.LocalTitle ?? ug.Game.Title, // Coalescing dla LocalTitle
                    ug.Game.GameGenres.Select(x => x.Genre.Name).ToList(),
                    ug.Game.MinPlayers,
                    ug.Game.MaxPlayers,
                    ug.Game.ImageUrl,
                    ug.Game.PlayTime))
                .ToListAsync();
        }

        // 5. POBIERANIE POJEDYNCZEJ GRY
        public async Task<GameListItemResponse?> GetByIdAsync(int gameId, int userId)
        {
            return await _db.UserGames
                .AsNoTracking()
                .Where(ug => ug.UserId == userId && ug.GameId == gameId)
                .Include(ug => ug.Game)
                    .ThenInclude(g => g.GameGenres)
                        .ThenInclude(gg => gg.Genre)
                .Select(ug => new GameListItemResponse(
                    ug.Game.Id,
                    ug.LocalTitle ?? ug.Game.Title, // Coalescing dla LocalTitle
                    ug.Game.GameGenres.Select(x => x.Genre.Name).ToList(),
                    ug.Game.MinPlayers,
                    ug.Game.MaxPlayers,
                    ug.Game.ImageUrl,
                    ug.Game.PlayTime))
                .FirstOrDefaultAsync();
        }

        // 6. IMPORT Z BGG (Obsługa LocalTitle z frontendu - ZAKŁADAM, ŻE DODAŁEŚ 'LocalTitle' DO CZEGOŚ, np. zmieniamy sygnaturę metody lub zakładasz, że przekażesz to osobno. Tu zrobię prosty wariant dla importu samej gry).
        public async Task<(Game? Game, ErrorResponseDto? Error)> ImportFromExternalAsync(string sourceId, int userId, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(sourceId))
                return (null, Errors.General.Validation("SourceId jest wymagane.", "SourceId"));

            var external = await _bgg.GetGameByIdAsync(sourceId, ct);

            if (external is null)
                return (null, Errors.Game.ExternalNotFound());

            var globalTitle = (external.Title ?? string.Empty).Trim();
            if (globalTitle.Length == 0)
                return (null, Errors.Game.ExternalInvalidData());

            // 1. Sprawdzamy czy gra z tego BGG ID już istnieje u nas w słowniku globalnym.
            int numericSourceId = int.Parse(sourceId); // Jeśli BGG Id to u Ciebie int
            var game = await _db.Games
                .Include(g => g.GameGenres)
                .FirstOrDefaultAsync(g => g.BggId == numericSourceId, ct);

            // Jeśli gry NIE MA w globalnej bazie, dodajemy ją na podstawie danych BGG.
            if (game is null)
            {
                var minPlayers = external.MinPlayers;
                var maxPlayers = external.MaxPlayers;

                if (minPlayers <= 0) minPlayers = 1;
                if (maxPlayers <= minPlayers) maxPlayers = minPlayers;

                var genreNames = (external.Genres ?? new List<string>())
                    .Where(n => !string.IsNullOrWhiteSpace(n))
                    .Select(n => n.Trim())
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToList();

                var lowered = genreNames.Select(n => n.ToLower()).ToList();

                var existingGenres = await _db.Genres
                    .Where(g => lowered.Contains(g.Name.ToLower()))
                    .ToListAsync(ct);

                game = new Game
                {
                    // USUNIĘTO: OwnerId = userId,
                    BggId = numericSourceId,
                    Title = globalTitle, // Zostawiamy w globalnej bazie oryginalny tytuł z BGG
                    IsCustom = false,
                    MinPlayers = minPlayers,
                    MaxPlayers = maxPlayers,
                    ImageUrl = external.ImageUrl,
                    PlayTime = external.PlayTime
                };

                foreach (var name in genreNames)
                {
                    var genre = existingGenres.FirstOrDefault(g =>
                        string.Equals(g.Name, name, StringComparison.OrdinalIgnoreCase));

                    if (genre is null)
                    {
                        genre = new Domain.Genre { Name = name };
                        _db.Genres.Add(genre);
                        existingGenres.Add(genre);
                    }

                    game.GameGenres.Add(new GameGenre { Genre = genre });
                }

                _db.Games.Add(game);
            }

            // 2. Niezależnie czy grę pobraliśmy przed chwilą z BGG, czy już tam była, dodajemy ją do kolekcji gracza
            bool alreadyInCollection = await _db.UserGames
                .AnyAsync(ug => ug.UserId == userId && (game.Id != 0 && ug.GameId == game.Id), ct);

            if (alreadyInCollection)
                return (null, Errors.Game.DuplicateTitle());

            var userGame = new UserGame
            {
                UserId = userId,
                Game = game,
                // Gdy dorobisz pole na frontendzie do przesyłania LocalTitle podczas importu,
                // to tutaj będziesz je zapisywał, np.: LocalTitle = dto.LocalTitle
            };

            _db.UserGames.Add(userGame);
            await _db.SaveChangesAsync(ct);

            return (game, null);
        }

    }
}