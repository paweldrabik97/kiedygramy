using kiedygramy.DTO.Game;

namespace kiedygramy.Services.External
{
    public interface IBoardGameGeekClientService
    {
        Task<IEnumerable<ExternalGameDto>> SearchGamesAsync(string query, CancellationToken cancellationToken = default);
        Task<ExternalGameDto?> GetGameByIdAsync(string sourceId, CancellationToken cancellationToken = default);

    }
}
