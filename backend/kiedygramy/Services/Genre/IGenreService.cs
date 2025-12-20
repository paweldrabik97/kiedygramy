using kiedygramy.DTO.Game;

namespace kiedygramy.Services.Genre
{
    public interface IGenreService
    {
        Task<List<GenreDto>> SearchAsync(string? query, CancellationToken ct);
    }
}
