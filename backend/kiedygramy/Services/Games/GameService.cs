using kiedygramy.Application.Errors;
using kiedygramy.Data;
using kiedygramy.Domain;
using kiedygramy.DTO.Common;
using kiedygramy.DTO.Game;
using kiedygramy.Services.External;
using kiedygramy.Services.Genre;
using Microsoft.EntityFrameworkCore;

namespace kiedygramy.Services.Games
{
    public class GameService : IGameService
    {
        private readonly AppDbContext _db;
        private readonly IBoardGameGeekClientService _bgg;
        private readonly IGeminiTranslationService _gemini;

        public GameService(AppDbContext db, IBoardGameGeekClientService bgg, IGeminiTranslationService gemini)
        {
            _db = db;
            _bgg = bgg;
            _gemini = gemini;
        }

        // 1. CREATE CUSTOM GAME (Entirely user-created from scratch)
        public async Task<(Game? game, ErrorResponseDto? error)> CreateAsync(CreateGameRequest dto, int userId)
        {
            var title = dto.Title.Trim();

            // 1. Check if a game with this title already exists in the global database
            var existingGame = await _db.Games
                .FirstOrDefaultAsync(g => g.Title.ToLower() == title.ToLower());

            Game gameToLink;

            if (existingGame is not null)
            {
                // Game exists. Check if the user already has it in their collection.
                bool alreadyInCollection = await _db.UserGames
                    .AnyAsync(ug => ug.UserId == userId && ug.GameId == existingGame.Id);

                if (alreadyInCollection)
                    return (null, Errors.Game.DuplicateTitle());

                gameToLink = existingGame;
            }
            else
            {
                // Game doesn't exist. Validate DTO.
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

                // Create a new CUSTOM game in the global catalog
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

            // Add to collection (without LocalTitle, because the player provided the title themselves)
            var userGame = new UserGame
            {
                UserId = userId,
                Game = gameToLink
            };

            _db.UserGames.Add(userGame);
            await _db.SaveChangesAsync();

            return (gameToLink, null);
        }

        // 2. UPDATE
        public async Task<ErrorResponseDto?> UpdateAsync(int gameId, UpdateGameRequest dto, int userId)
        {
            // Fetch the user's game linking entity along with global game details and genres
            var userGame = await _db.UserGames
                .Include(ug => ug.Game).ThenInclude(g => g.GameGenres)
                .FirstOrDefaultAsync(ug => ug.UserId == userId && ug.GameId == gameId);

            if (userGame is null)
                return Errors.Game.NotFound();

            var game = userGame.Game;

            // --- 1. USER-SPECIFIC DATA UPDATE ---
            // These fields belong to the user's personal collection, so they can always be edited.

            if (dto.LocalTitle is not null)
                userGame.LocalTitle = dto.LocalTitle.Trim();

            if (dto.Rating.HasValue)
                userGame.Rating = dto.Rating.Value;

            // --- 2. GLOBAL DATA UPDATE SECURITY CHECK ---
            // If the game was imported from an external source (BGG), it shouldn't be fully editable.
            // We save the user-specific changes and return early.
            if (!game.IsCustom)
            {
                await _db.SaveChangesAsync();
                return null;
            }

            // --- 3. GLOBAL DATA UPDATE (ONLY FOR CUSTOM GAMES) ---

            // Title validation and update
            if (!string.IsNullOrWhiteSpace(dto.Title))
            {
                var title = dto.Title.Trim();
                bool exists = await _db.Games
                    .AnyAsync(g => g.Title.ToLower() == title.ToLower() && g.Id != gameId);

                if (exists)
                    return Errors.Game.DuplicateTitle();

                game.Title = title;
            }

            // Players count validation and update
            // We resolve the values (either from DTO or keep existing) to validate properly
            int minPlayers = dto.MinPlayers ?? game.MinPlayers;
            int maxPlayers = dto.MaxPlayers ?? game.MaxPlayers;

            if (maxPlayers < minPlayers)
                return Errors.Game.MaxPlayersMustBeGreaterOrEqualMin();

            if (minPlayers <= 0)
                return Errors.Game.MinPlayersMustBeGreaterThanZero();

            game.MinPlayers = minPlayers;
            game.MaxPlayers = maxPlayers;

            // Optional fields update
            if (dto.PlayTime is not null)
                game.PlayTime = dto.PlayTime;

            if (dto.ImageUrl is not null)
                game.ImageUrl = dto.ImageUrl;

            // Genres validation and update
            if (dto.GenreIds is not null)
            {
                var genreIds = dto.GenreIds.Distinct().ToList();

                var genres = await _db.Genres
                    .Where(g => genreIds.Contains(g.Id))
                    .ToListAsync();

                if (genres.Count != genreIds.Count)
                    return Errors.General.Validation("Selected category does not exist.", "GenreIds");

                game.GameGenres.Clear();

                foreach (var genre in genres)
                {
                    game.GameGenres.Add(new GameGenre { GameId = game.Id, GenreId = genre.Id });
                }
            }

            // Save all changes to the database
            await _db.SaveChangesAsync();
            return null;
        }

        // 3. DELETE (Remove only the link from the junction table, unless the player was the author of the IsCustom game)
        public async Task<ErrorResponseDto?> DeleteAsync(int gameId, int userId)
        {
            var userGame = await _db.UserGames
                .Include(ug => ug.Game)
                .FirstOrDefaultAsync(ug => ug.UserId == userId && ug.GameId == gameId);

            if (userGame is null)
                return Errors.Game.NotFound();

            _db.UserGames.Remove(userGame);

            if (userGame.Game.IsCustom && userGame.Game.CreatedById == userId)
            {
                _db.Games.Remove(userGame.Game);
            }

            await _db.SaveChangesAsync();
            return null;
        }

        // 4. GET LIST
        public async Task<IEnumerable<GameListItemResponse>> GetAllAsync(int userId)
        {
            return await _db.UserGames
                .AsNoTracking()
                .Where(ug => ug.UserId == userId)
                // Note: Include() and ThenInclude() are removed because .Select() 
                // automatically handles the required SQL JOINs.
                .Select(ug => new GameListItemResponse(
                    ug.Game.Id,
                    ug.Game.Title,                                         // Global Title
                    ug.LocalTitle,                                         // User's Local Title
                    ug.Game.GameGenres.Select(x => x.Genre.Name).ToList(), // Genres
                    ug.Game.MinPlayers,
                    ug.Game.MaxPlayers,
                    ug.Game.ImageUrl,
                    ug.Game.PlayTime,
                    ug.Rating,                                        // Default to 0 if no rating
                    ug.Game.IsCustom                                       // Custom game flag
                ))
                .ToListAsync();
        }

        // 5. GET SINGLE GAME
        public async Task<GameListItemResponse?> GetByIdAsync(int gameId, int userId)
        {
            return await _db.UserGames
                .AsNoTracking()
                .Where(ug => ug.UserId == userId && ug.GameId == gameId)
                .Select(ug => new GameListItemResponse(
                    ug.Game.Id,
                    ug.Game.Title,
                    ug.LocalTitle,
                    ug.Game.GameGenres.Select(x => x.Genre.Name).ToList(),
                    ug.Game.MinPlayers,
                    ug.Game.MaxPlayers,
                    ug.Game.ImageUrl,
                    ug.Game.PlayTime,
                    ug.Rating,                                        // Default to 0 if no rating
                    ug.Game.IsCustom
                ))
                .FirstOrDefaultAsync();
        }

        public async Task<(Game? Game, ErrorResponseDto? Error)> ImportFromExternalAsync(string sourceId, string? localTitle, int userId, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(sourceId))
                return (null, Errors.General.Validation("SourceId jest wymagane.", "SourceId"));

            var external = await _bgg.GetGameByIdAsync(sourceId, ct);

            if (external is null)
                return (null, Errors.Game.ExternalNotFound());

            var globalTitle = (external.Title ?? string.Empty).Trim();
            if (globalTitle.Length == 0)
                return (null, Errors.Game.ExternalInvalidData());

            // 1. Check if a game with this BGG ID already exists in our global dictionary.
            int numericSourceId = int.Parse(sourceId); // If BGG Id is an int in your system
            var game = await _db.Games
                .Include(g => g.GameGenres)
                .FirstOrDefaultAsync(g => g.BggId == numericSourceId, ct);

            // If the game does NOT exist in the global database, add it based on BGG data.
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
                    .Include(g => g.Translations)
                    .Where(g => lowered.Contains(g.Name.ToLower()))
                    .ToListAsync(ct);

                game = new Game
                {
                    BggId = numericSourceId,
                    Title = globalTitle, // Keep the original BGG title in the global database
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
                        genre = new Domain.Genre { 
                            Name = name,
                            Translations = new List<GenreTranslation>()
                        };

                        genre.Translations.Add(new GenreTranslation
                        {
                            Genre = genre,
                            LanguageCode = "en",
                            Name = name 
                        });

                        // request to AI
                        var translationDict = await _gemini.TranslateGenreToMultipleLanguagesAsync(name);

                        if (translationDict is not null)
                        {
                            foreach (var kvp in translationDict)
                            {
                                genre.Translations.Add(new GenreTranslation
                                {
                                    Genre = genre,
                                    LanguageCode = kvp.Key,
                                    Name = kvp.Value
                                });
                            }
                        }    
                        _db.Genres.Add(genre);
                        existingGenres.Add(genre);
                    }

                    game.GameGenres.Add(new GameGenre { Genre = genre });
                }

                _db.Games.Add(game);
            }

            // 2. Regardless of whether we just fetched the game from BGG or it was already there, add it to the player's collection
            bool alreadyInCollection = await _db.UserGames
                .AnyAsync(ug => ug.UserId == userId && (game.Id != 0 && ug.GameId == game.Id), ct);

            if (alreadyInCollection)
                return (null, Errors.Game.DuplicateTitle());

            var userGame = new UserGame
            {
                UserId = userId,
                Game = game,
                LocalTitle = localTitle 
            };

            _db.UserGames.Add(userGame);
            await _db.SaveChangesAsync(ct);

            return (game, null);
        }

    }
}