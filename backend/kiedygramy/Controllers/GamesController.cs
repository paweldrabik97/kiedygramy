using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using kiedygramy.Domain;
using kiedygramy.DTO.Game;
using kiedygramy.Controllers.Base;
using kiedygramy.Services.Games;


namespace kiedygramy.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/my/games")]
    public class GamesController : ApiControllerBase
    {            
        private readonly IGameService _gameService;

        public GamesController(IGameService gameService)
        { 
            _gameService = gameService;           
        }
      
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateGameRequest dto)
        {
            if(!ModelState.IsValid)
                return ValidationProblemFromModelState();

            var userId = GetRequiredUserId();

            var (game, error) = await _gameService.CreateAsync(dto, userId);

            if (error is not null)
                return Problem(error);

            var created = await _gameService.GetByIdAsync(game!.Id, userId);

            return CreatedAtAction(nameof(GetById), new { id = game.Id }, created);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<GameListItemResponse>>> GetAll()
        {
            var userId = GetRequiredUserId();

            var games = await _gameService.GetAllAsync(userId);
            return Ok(games);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var userId = GetRequiredUserId();

            var game = await _gameService.GetByIdAsync(id, userId);

            if (game is null)
                return NotFound();

            return Ok(game);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateGameRequest dto)
        {
            if (!ModelState.IsValid)
                return ValidationProblemFromModelState();

            var userId = GetRequiredUserId();

            var error = await _gameService.UpdateAsync(id, dto, userId);

            if (error is not null)
                return Problem(error);

            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = GetRequiredUserId();

            var error = await _gameService.DeleteAsync(id, userId);

            if (error is null)
                return NoContent();
            
            return Problem(error);
        }

        [HttpPost("from-external")]
        public async Task<IActionResult> ImportFromExternal( [FromBody] ImportGameFromExternalRequest dto, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return ValidationProblemFromModelState();

            var userId = GetRequiredUserId();

            var (game, error) = await _gameService.ImportFromExternalAsync(dto.SourceId, userId, cancellationToken);

            if (error is not null)
                return Problem(error);

            var created = await _gameService.GetByIdAsync(game!.Id, userId);

            return CreatedAtAction(nameof(GetById), new { id = game.Id }, created);
        }
    }
}
