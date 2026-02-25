using kiedygramy.Domain;
using kiedygramy.DTO.Common;
using kiedygramy.DTO.Game;

namespace kiedygramy.Services.Games
{
    public interface IGameService
    {
        Task<(Game? game, ErrorResponseDto? error)> CreateAsync(CreateGameRequest dto, int userId);
        Task<ErrorResponseDto?> UpdateAsync(int gameId, UpdateGameRequest dto, int userId);
        Task<ErrorResponseDto?> DeleteAsync(int gameId, int userId);
        Task<IEnumerable<GameListItemResponse>> GetAllAsync(int userId);
        Task<GameListItemResponse?> GetByIdAsync(int gameId, int userId);
        Task<(Game? Game, ErrorResponseDto? Error)> ImportFromExternalAsync(string sourceId, string? localTitle, int userId, CancellationToken ct = default);
    }
}
