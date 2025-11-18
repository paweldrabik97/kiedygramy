using kiedygramy.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using kiedygramy.Domain;
using Microsoft.EntityFrameworkCore;
using kiedygramy.DTO.Game;

namespace kiedygramy.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/my/games")]
    public class MyGamesController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly UserManager<User> _userManager;

        public MyGamesController(AppDbContext db, UserManager<User> userManager)
        {
            _db = db;
            _userManager = userManager;
        }

        
        [HttpPost]

        public async Task<IActionResult> Create([FromBody] CreateGameDto dto)
        {
            var me = await _userManager.GetUserAsync(User);

            if (me is null)
                return Unauthorized();

            if (string.IsNullOrWhiteSpace(dto.Title))
                return BadRequest("Tytuł jest wymagany.");

            if (dto.MinPlayers <= 0)
                return BadRequest("Minimalna liczba graczy musi być większa od zera.");

            if (dto.MaxPlayers < dto.MinPlayers)
                return BadRequest("Maksymalna liczba graczy musi być większa lub równa minimalnej liczbie graczy.");

            bool exists = await _db.Games
                .AnyAsync(g => g.OwnerId == me.Id && g.Title == dto.Title);
            if (exists)
                return BadRequest("Masz już grę o takim tytule");

            var game = new Game
            {
                OwnerId = me.Id,
                Title = dto.Title.Trim(),
                Genre = String.IsNullOrWhiteSpace(dto.Genre) ? null : dto.Genre.Trim(),
                MinPlayers = dto.MinPlayers,
                MaxPlayers = dto.MaxPlayers
            };

            _db.Games.Add(game);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = game.Id }, new
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

            var games = await _db.Games
                .Where(g => g.OwnerId == me.Id)
                .Select(g => new
                {
                    g.Id,
                    g.Title,
                    g.Genre,
                    g.MinPlayers,
                    g.MaxPlayers
                })
                .ToListAsync();

            return Ok(games);
        }

        [HttpGet("{id:int}")]

        public async Task<IActionResult> GetById(int id)
        {
            var me = await _userManager.GetUserAsync(User);

            if (me is null)
                return Unauthorized();

            var game = await _db.Games
                .Where(g => g.OwnerId == me.Id && g.Id == id)
                .Select(g => new
                {
                    g.Id,
                    g.Title,
                    g.Genre,
                    g.MinPlayers,
                    g.MaxPlayers
                })
                .FirstOrDefaultAsync();

            if (game is null)
                return NotFound();

            return Ok(game);


        }

        [HttpPut("{id:int}")]

        public async Task<IActionResult> Update(int id, [FromBody] UpdateGameDto dto)
        { 
            var me = await _userManager.GetUserAsync(User);
            if(me is null)
                return Unauthorized();

            var game = await _db.Games.FirstOrDefaultAsync(g => g.OwnerId == me.Id && g.Id == id);
            if(game is null)
                return NotFound();

            if(string.IsNullOrWhiteSpace(dto.Title))
                return BadRequest("Tytuł jest wymagany.");

            if (dto.MinPlayers <= 0)
                return BadRequest("Minimalna liczba graczy musi być większa od zera.");

            if (dto.MaxPlayers < dto.MinPlayers)
                return BadRequest("Maksymalna liczba graczy musi być większa lub równa minimalnej liczbie graczy.");

            bool exists = await _db.Games
                .AnyAsync(g => g.OwnerId == me.Id && g.Title == dto.Title);
            if (exists)
                return BadRequest("Masz już grę o takim tytule");

            game.Title = dto.Title.Trim();
            game.Genre = String.IsNullOrWhiteSpace(dto.Genre) ? null : dto.Genre.Trim();
            game.MinPlayers = dto.MinPlayers;
            game.MaxPlayers = dto.MaxPlayers;
            
            await _db.SaveChangesAsync();
            return NoContent(); 
        }

        [HttpDelete("{id:int}")]

        public async Task<IActionResult> Delete(int id)
        {
            var me = await _userManager.GetUserAsync(User);

            if (me is null)
                return Unauthorized();

            var game = await _db.Games.FirstOrDefaultAsync(g => g.OwnerId == me.Id && g.Id == id);

            if (game is null)
                return NotFound();

            _db.Games.Remove(game);

            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
