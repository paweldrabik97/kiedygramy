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

        public async Task<(Game? game, ErrorResponseDto? error)> CreateAsync(CreateGameDto dto, int userId)
        {             
            var title = dto.Title.Trim(); 
            
            bool exists = await _db.Games
                .AnyAsync(g => g.OwnerId == userId && g.Title.ToLower() == title.ToLower());

            if (exists)
                return (null, Errors.Game.DuplicateTitle());

            if (dto.MaxPlayers < dto.MinPlayers)
                return (null, Errors.Game.MaxPlayersMustBeGreaterOrEqualMin());

            if (dto.MinPlayers <= 0)
                return (null, Errors.Game.MinPlayersMustBeGreaterThanZero());

            var genreIds = (dto.GenreIds ?? new List<int>())
                .Distinct()
                .ToList();

            var genre = await _db.Genres
                .Where(g => genreIds.Contains(g.Id))
                .ToListAsync();

            if (genre.Count != genreIds.Count)
                return (null, Errors.General.Validation("Wybrano nieistniejącą kategorię.", "GenreIds"));

            var game = new Game
            {
                OwnerId = userId,
                Title = title,
                
                GameGenres = genre
                    .Select(g => new GameGenre { GenreId = g.Id })
                    .ToList(),

                MinPlayers = dto.MinPlayers,
                MaxPlayers = dto.MaxPlayers,
                ImageUrl = dto.ImageUrl,
                PlayTime = dto.PlayTime
            };

            _db.Games.Add(game);
            await _db.SaveChangesAsync();

            return (game, null);
        }

        public async Task<ErrorResponseDto?> UpdateAsync(int gameId, UpdateGameDto dto, int userId)
        {            
            var game = await _db.Games
                .Include(g => g.GameGenres)
                .FirstOrDefaultAsync(g => g.OwnerId == userId && g.Id == gameId);

            if (game is null)
            return Errors.Game.NotFound();

            var title = dto.Title.Trim();

            bool exists = await _db.Games
                .AnyAsync(g => g.OwnerId == userId && g.Title.ToLower() == title.ToLower() && g.Id != gameId);

            if (exists)
                return Errors.Game.DuplicateTitle();

            if (dto.MaxPlayers < dto.MinPlayers)
                return Errors.Game.MaxPlayersMustBeGreaterOrEqualMin();

            if(dto.MinPlayers <= 0)
                return Errors.Game.MinPlayersMustBeGreaterThanZero();

            var genreIds = (dto.GenreIds ?? new List<int>())
                .Distinct()
                .ToList();

            var generes = await _db.Genres
                .Where(g => genreIds.Contains(g.Id))
                .ToListAsync();

            if (generes.Count != genreIds.Count)
                return Errors.General.Validation("Wybrano nieistniejącą kategorię.", "GenreIds");

            game.Title = title;

            game.GameGenres.Clear();

            foreach (var genre in generes)
            {
                game.GameGenres.Add(new GameGenre { GameId = game.Id, GenreId = genre.Id });
            }

            game.MinPlayers = dto.MinPlayers;
            game.MaxPlayers = dto.MaxPlayers;

            await _db.SaveChangesAsync();
            return null; 
        }

        public async Task<ErrorResponseDto?> DeleteAsync(int gameId, int userId)
        {
            var game = await _db.Games
                .FirstOrDefaultAsync(g => g.OwnerId == userId && g.Id == gameId);

            if (game is null)
            return Errors.Game.NotFound();

            _db.Games.Remove(game);
            await _db.SaveChangesAsync();
            return null;
        }

        public async Task<IEnumerable<GameListItemDto>> GetAllAsync(int userId)
        {
            return await _db.Games
                .AsNoTracking()
                .Where(g => g.OwnerId == userId)
                .Include(g => g.GameGenres)
                    .ThenInclude(gg => gg.Genre)
                .Select(g => new GameListItemDto(
                    g.Id,
                    g.Title,
                    g.GameGenres.Select(x => x.Genre.Name).ToList(),
                    g.MinPlayers,
                    g.MaxPlayers,
                    g.ImageUrl,
                    g.PlayTime))
                .ToListAsync();
        }

        public async Task<GameListItemDto?> GetByIdAsync(int gameId, int userId)
        {
            return await _db.Games
                .AsNoTracking()
                .Where(g => g.OwnerId == userId && g.Id == gameId)
                .Include(g => g.GameGenres)
                    .ThenInclude(gg => gg.Genre)
                .Select(g => new GameListItemDto(
                    g.Id,
                    g.Title,
                    g.GameGenres.Select(x => x.Genre.Name).ToList(),
                    g.MinPlayers,
                    g.MaxPlayers,
                    g.ImageUrl,
                    g.PlayTime))
                .FirstOrDefaultAsync();
        }

        public async Task<(Game? Game, ErrorResponseDto? Error)> ImportFromExternalAsync( string sourceId, int userId, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(sourceId))
                return (null, Errors.General.Validation("SourceId jest wymagane.", "SourceId"));

            var external = await _bgg.GetGameByIdAsync(sourceId, ct);

            if (external is null)
                return (null, Errors.Game.ExternalNotFound()); 
         
            var title = (external.Title ?? string.Empty).Trim();
            if (title.Length == 0)
                return (null, Errors.Game.ExternalInvalidData()); 
          
            var exists = await _db.Games
                .AnyAsync(g => g.OwnerId == userId && g.Title.ToLower() == title.ToLower(), ct);

            if (exists)
                return (null, Errors.Game.DuplicateTitle());
            
            var minPlayers = external.MinPlayers;
            var maxPlayers = external.MaxPlayers;

            if (minPlayers <= 0)
                minPlayers = 1;

            if (maxPlayers <= minPlayers)
                maxPlayers = minPlayers;

            var genreNames = (external.Genres ?? new List<string>())
                .Where(n => !string.IsNullOrWhiteSpace(n))
                .Select(n => n.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            var lowered = genreNames
                .Select(n => n.ToLower())
                .ToList();

            var existingGenres = await _db.Genres
                .Where(g => lowered.Contains(g.Name.ToLower()))
                .ToListAsync(ct);

            var game = new Game
            {
                OwnerId = userId,
                Title = title,                
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
                    genre = new Domain.Genre { Name = name }; // do poprawy na później narazie fast fix
                    _db.Genres.Add(genre);
                    existingGenres.Add(genre);
                }

                game.GameGenres.Add(new GameGenre
                {
                    Genre = genre
                });
            }

            _db.Games.Add(game);
            await _db.SaveChangesAsync(ct);

            return (game, null);
        }

    }
}
