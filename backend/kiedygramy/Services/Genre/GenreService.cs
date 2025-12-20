using kiedygramy.Data;
using kiedygramy.DTO.Game;
using Microsoft.EntityFrameworkCore;

namespace kiedygramy.Services.Genre
{
    public class GenreService : IGenreService
    {
        private readonly AppDbContext _db;
        public GenreService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<List<GenreDto>> SearchAsync(string? query, CancellationToken ct)
        {
            const int TakeLimit = 50;

            var q = _db.Genres.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(query))
            {
                var loweredQuery = query.Trim().ToLower();
                q = q.Where(g => g.Name.ToLower().Contains(loweredQuery));
            }

            return await q
                .OrderBy(g => g.Name)
                .Take(TakeLimit)
                .Select(g => new GenreDto( g.Id, g.Name))
                .ToListAsync(ct);
        }
    }
}
