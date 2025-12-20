using kiedygramy.Domain;
using kiedygramy.DTO.Common;
using kiedygramy.DTO.Game;

namespace kiedygramy.Services.Games
{
    public interface IGameService
    {
        Task<(Game? game, ErrorResponseDto? error)> CreateAsync(CreateGameDto dto, int userId);
        Task<ErrorResponseDto?> UpdateAsync(int gameId, UpdateGameDto dto, int userId);
        Task<ErrorResponseDto?> DeleteAsync(int gameId, int userId);
        Task<IEnumerable<GameListItemDto>> GetAllAsync(int userId);
        Task<GameListItemDto?> GetByIdAsync(int gameId, int userId);
        Task<(Game? Game, ErrorResponseDto? Error)> ImportFromExternalAsync( string sourceId, int userId, CancellationToken cancellationToken = default);
    }
}
