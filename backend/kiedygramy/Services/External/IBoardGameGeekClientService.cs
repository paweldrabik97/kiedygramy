using kiedygramy.DTO.Game;

namespace kiedygramy.Services.External
{
    public interface IBoardGameGeekClientService
    {
        Task<IEnumerable<ExternalGameResponse>> SearchGamesAsync(string query, int skip, int take, CancellationToken cancellationToken = default);
        Task<ExternalGameResponse?> GetGameByIdAsync(string sourceId, CancellationToken cancellationToken = default);

    }
}
