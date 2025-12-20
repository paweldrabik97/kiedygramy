using kiedygramy.Application.Errors;
using kiedygramy.Controllers.Base;
using kiedygramy.DTO.Game;
using kiedygramy.Services.External;
using Microsoft.AspNetCore.Mvc;

namespace kiedygramy.Controllers
{
    [ApiController]
    [Route("api/external/games")]
    public class ExternalGamesController : ApiControllerBase
    {
        private readonly IBoardGameGeekClientService _client;

        public ExternalGamesController(IBoardGameGeekClientService client)
        {
            _client = client;
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<ExternalGameDto>>> SearchGames([FromQuery]string query, CancellationToken cancellationToken)
        {           
            var games = await _client.SearchGamesAsync(query, cancellationToken);
                
             return Ok(games);
             
        }
    }
}
