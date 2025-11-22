using kiedygramy.Controllers.Base;
using kiedygramy.Domain;
using kiedygramy.DTO.Session;
using kiedygramy.Services.Sessions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;


namespace kiedygramy.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/my/sessions")]
    public class MySessionsController : ApiControllerBase
    {
        private readonly ISessionService _sessionService;
        private readonly UserManager<User> _userManager;

        public MySessionsController(ISessionService sessionService, UserManager<User> userManager)
        {
            _sessionService = sessionService;
            _userManager = userManager;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSessionDto dto)
        {
            var me = await _userManager.GetUserAsync(User);
            if (me is null)
                return Unauthorized();

            var (session, error) = await _sessionService.CreateAsync(dto, me.Id);

            if (error is not null)
                return BadRequest(error);

            return CreatedAtAction(nameof(GetById), new { id = session!.Id }, session);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var me = await _userManager.GetUserAsync(User);
            if (me is null)
                return Unauthorized();

            var session = await _sessionService.GetByIdAsync(id, me.Id);

            if (session is null)
                return NotFound();

            return Ok(session);
        }

        [HttpGet]
        public async Task<IActionResult> GetMine()
        {
            var me = await _userManager.GetUserAsync(User);
            if (me is null)
                return Unauthorized();

            var list = await _sessionService.GetMineAsync(me.Id);

            return Ok(list);
        }
    }

}
