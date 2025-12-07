using kiedygramy.Data;
using kiedygramy.Domain;
using kiedygramy.DTO.Common;
using kiedygramy.DTO.Game;
using Microsoft.EntityFrameworkCore;

namespace kiedygramy.Services.Games
{
    public class GameService : IGameService
    {
        private readonly AppDbContext _db;

        public GameService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<(Game? game, ErrorResponseDto? error)> CreateAsync(CreateGameDto dto, int userId)
        {   
            var title = dto.Title?.Trim();  

            var validationError = ValidateGame(title, dto.MinPlayers, dto.MaxPlayers);
            if (validationError is not null)
                return (null, validationError);

            
            bool exists = await _db.Games
                .AnyAsync(g => g.OwnerId == userId && g.Title.ToLower() == title.ToLower());

            if (exists)
            return (null, DuplicateTitleError());

            var game = new Game
            {
                OwnerId = userId,
                Title = title,
                Genre = string.IsNullOrWhiteSpace(dto.Genre) ? null : dto.Genre.Trim(),
                MinPlayers = dto.MinPlayers,
                MaxPlayers = dto.MaxPlayers
            };

            _db.Games.Add(game);
            await _db.SaveChangesAsync();

            return (game, null);
        }

        public async Task<ErrorResponseDto?> UpdateAsync(int gameId, UpdateGameDto dto, int userId)
        {
            var title = dto.Title?.Trim();

            var game = await _db.Games
                .FirstOrDefaultAsync(g => g.OwnerId == userId && g.Id == gameId);

            if (game is null)
            return NotExistError();

            var validationError = ValidateGame(title, dto.MinPlayers, dto.MaxPlayers);
            
            if (validationError is not null)
                return validationError;

            bool exists = await _db.Games
                .AnyAsync(g => g.OwnerId == userId && g.Title.ToLower() == title.ToLower() && g.Id != gameId);

            if (exists)
            return DuplicateTitleError();

            game.Title = title;
            game.Genre = string.IsNullOrWhiteSpace(dto.Genre) ? null : dto.Genre.Trim();
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
            return NotExistError();

            _db.Games.Remove(game);
            await _db.SaveChangesAsync();
            return null;
        }

        public async Task<IEnumerable<GameListItemDto>> GetAllAsync(int userId)
        {
            return await _db.Games
                .AsNoTracking()
                .Where(g => g.OwnerId == userId)
                .Select(g => new GameListItemDto(
                    g.Id,
                    g.Title,
                    g.Genre,
                    g.MinPlayers,
                    g.MaxPlayers))
                .ToListAsync();
        }

        public async Task<GameListItemDto?> GetByIdAsync(int gameId, int userId)
        {
            return await _db.Games
                .AsNoTracking()
                .Where(g => g.OwnerId == userId && g.Id == gameId)
                .Select(g => new GameListItemDto(
                    g.Id,
                    g.Title,
                    g.Genre,
                    g.MinPlayers,
                    g.MaxPlayers))
                .FirstOrDefaultAsync();
        }

        private ErrorResponseDto? ValidateGame(string title, int minPlayers, int maxPlayers)
        {
            if (string.IsNullOrWhiteSpace(title))
            {
                var errors = new Dictionary<string, string[]>
                {
                    { "Title", new[] { "Tytuł jest wymagany." } }
                };

                return new ErrorResponseDto(
                    status: 400,
                    title: "Validation Failed",
                    detail: "Tytuł jest wymagany.",
                    instance: null,
                    errors: errors);
            }

            if (title.Length < 2 || title.Length > 100)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { "Title", new[] { "Tytuł gry musi mieć od 2 do 100 znaków." } }
                };

                return new ErrorResponseDto(
                    status: 400,
                    title: "Validation Failed",
                    detail: "Tytuł gry ma nieprawidłową długość.",
                    instance: null,
                    errors: errors);
            }

            if (minPlayers <= 0)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { "MinPlayers", new[] { "Minimalna liczba graczy musi być większa niż 0." } }
                };

                return  new ErrorResponseDto(
                    status: 400,
                    title: "Validation Failed",
                    detail: "Minimalna liczba graczy musi być większa od 0.",
                    instance: null,
                    errors: errors);
            }
            
            if (maxPlayers < minPlayers)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { "MaxPlayers", new[] { "Maksymalna liczba graczy musi być większa lub równa minimalnej liczbie graczy." } }
                };

                return new ErrorResponseDto(
                    status: 400,
                    title: "Validation Failed",
                    detail: "Maksymalna liczba graczy musi być większa lub równa minimalnej liczbie graczy.",
                    instance: null,
                    errors: errors);
            }

            return null;
        }

        private ErrorResponseDto DuplicateTitleError()
        {
            var errors = new Dictionary<string, string[]>
            {
                { "Title", new[] { "Masz już grę o takim tytule." } }
            };
            return new ErrorResponseDto(
                status: 400,
                title: "Validation Failed",
                detail: "Masz już grę o takim tytule.",
                instance: null,
                errors: errors);
        }

        private ErrorResponseDto NotExistError()
        {
            return new ErrorResponseDto(
                   status: 404,
                   title: "Not Found",
                   detail: "Gra nie została znaleziona.",
                   instance: null,
                   errors: null);
        }
    }
}
