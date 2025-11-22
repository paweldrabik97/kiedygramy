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
    public class MyGamesController : ApiControllerBase
    {
      
        private readonly UserManager<User> _userManager;
        private readonly IGameService _gameService;

        public MyGamesController(IGameService gameService, UserManager<User> userManager)
        { 
            _gameService = gameService;
            _userManager = userManager;
        }

        
        [HttpPost]

        public async Task<IActionResult> Create([FromBody] CreateGameDto dto)
        {
            var me = await _userManager.GetUserAsync(User);

            if (me is null)
                return Unauthorized();

            var (game, error) = await _gameService.CreateAsync(dto, me.Id);

            if (error is not null)
                return BadRequest(error);

            return CreatedAtAction(nameof(GetById), new { id = game!.Id }, new
            {
                game.Id,
                game.Title,
                game.Genre,
                game.MinPlayers,
                game.MaxPlayers
            });


        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<GameListItemDto>>> GetAll()
        {
            var me = await _userManager.GetUserAsync(User);
            if (me is null)
                return Unauthorized();

            var games = await _gameService.GetAllAsync(me.Id);
            return Ok(games);
        }


        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var me = await _userManager.GetUserAsync(User);
            if (me is null)
                return Unauthorized();

            var game = await _gameService.GetByIdAsync(id, me.Id);

            if (game is null)
                return NotFound();

            return Ok(game);
        }


        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateGameDto dto)
        {
            var me = await _userManager.GetUserAsync(User);
            if (me is null)
                return Unauthorized();

            var error = await _gameService.UpdateAsync(id, dto, me.Id);

            if (error is null)
                return NoContent();

            if (error.status == 404)
                return NotFound(error);

            return BadRequest(error);
        }


        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var me = await _userManager.GetUserAsync(User);
            if (me is null)
                return Unauthorized();

            var error = await _gameService.DeleteAsync(id, me.Id);

            if (error is null)
                return NoContent();

            if (error.status == 404)
                return NotFound(error);

            return BadRequest(error);
        }

    }
}
