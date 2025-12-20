using kiedygramy.Controllers.Base;
using Microsoft.AspNetCore.Mvc;
using kiedygramy.Services.Genre;
using kiedygramy.DTO.Game;
using Microsoft.AspNetCore.Authorization;

namespace kiedygramy.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/genres")]
    public class GenreController : ApiControllerBase
    {
        private readonly IGenreService _genreService;

        [HttpGet]
        public async Task<ActionResult<List<GenreDto>>> GetAll([FromQuery] string? query, CancellationToken ct)
        {            
            var result = await _genreService.SearchAsync(query, ct);
            return Ok(result);
        }
    }
}
