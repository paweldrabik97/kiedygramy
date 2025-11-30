using kiedygramy.Controllers.Base;
using kiedygramy.Domain;
using kiedygramy.DTO.Common;
using kiedygramy.DTO.Session;
using kiedygramy.Services.Sessions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using kiedygramy.Services.Chat;



namespace kiedygramy.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/my/sessions")]
    public class MySessionsController : ApiControllerBase
    {
        private readonly ISessionService _sessionService;
        private readonly UserManager<User> _userManager;
        private readonly ISessionChatService _sessionChatService;

        public MySessionsController(
            ISessionService sessionService,
            UserManager<User> userManager,
            ISessionChatService sessionChatService)
        {
            _sessionService = sessionService;
            _userManager = userManager;
            _sessionChatService = sessionChatService;
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

        

        [HttpPost("{id:int}/respond")]

        public async Task<IActionResult> Respond(int id, [FromBody] RespondToInvitationDto dto)
        { 
            var me = await _userManager.GetUserAsync(User);

            if (me is null)
                return Unauthorized();

            var serviceError = await _sessionService.RespondToInviteAsync(id, me.Id, dto.Accept);

            if (serviceError is null)
                return NoContent();

            if(serviceError.status == 404)
                return NotFound(serviceError);

            return BadRequest(serviceError);
        }
        [HttpPost("{id:int}/invite")]
        public async Task<IActionResult> Invite(int id, [FromBody] InviteUserToSessionDto dto)
        {
            var me = await _userManager.GetUserAsync(User);
            if (me is null)
                return Unauthorized();

            var invited = await _userManager.FindByNameAsync(dto.UsernameOrEmail)
                ?? await _userManager.FindByEmailAsync(dto.UsernameOrEmail);

            if (invited is null)
            {
                var error = new ErrorResponseDto(
                    status: 400,
                    title: "User not found",
                    detail: "The user you are trying to invite does not exist.",
                    instance: null,
                    errors: new Dictionary<string, string[]>
                    {
                        { "UsernameOrEmail", new[] { "Użytkownik nie istnieje" } }
                    });

                return BadRequest(error);
            }

            var ErrorFromService = await _sessionService.InviteAsync(id, invited.Id, me.Id);

            if (ErrorFromService is not null)
            { 
                if(ErrorFromService.status == 404)
                    return NotFound(ErrorFromService);
                
                return BadRequest(ErrorFromService);
            }

            return NoContent();
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

        [HttpGet("{id:int}/participants")]
        public async Task<IActionResult> GetParticipants(int id)
        {
            var me = await _userManager.GetUserAsync(User);

            if (me is null)
                return Unauthorized();

            var (participants, error) = await _sessionService.GetParticipantsAsync(id, me.Id);

            if (error is not null)
            { 
                if(error.status == 404)
                    return NotFound(error); 

                return BadRequest(error);
            }
            return Ok(participants);
        }

        [HttpGet("invited")]
        public async Task<ActionResult<IEnumerable<SessionListItemDto>>> GetInvited()
        { 
            var me = await _userManager.GetUserAsync(User);

            if (me is null)
                return Unauthorized();

            var list = await _sessionService.GetInvitedAsync(me.Id);

            return Ok(list);
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
        [HttpGet("{id:int}/chat/messages")]
        public async Task<IActionResult> GetMessages(int id, [FromQuery] int? limit, [FromQuery] int? beforeMessageId)
        {
            var me = await _userManager.GetUserAsync(User);

            if (me is null)
                return Unauthorized();

            var (messages, error) = await _sessionChatService.GetMessagesAsync(id, me.Id, limit, beforeMessageId);
            
            if (error is not null)
            {
                if (error.status == 404)
                    return NotFound(error);

                if (error.status == 403)
                    return Forbid();

                return BadRequest(error);


            }
            return Ok(messages);
        }

        [HttpPost("{id:int}/chat/messages")]
        public async Task<IActionResult> SendMessage(int id, [FromBody] CreateSessionMessageDto dto)
        {
            var me = await _userManager.GetUserAsync(User);
            if (me is null)
                return Unauthorized();

            var (message, error) = await _sessionChatService.AddMessageAsync(id, me.Id, dto);

            if (error is not null)
            {
                if (error.status == 404)
                    return NotFound(error);

                if (error.status == 403)
                    return Forbid();

                return BadRequest(error);
            }

            return Ok(message);
        }


    }

}
