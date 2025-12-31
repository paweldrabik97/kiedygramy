using kiedygramy.Controllers.Base;
using kiedygramy.Domain;
using kiedygramy.Services.Sessions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using kiedygramy.Services.Chat;
using kiedygramy.Application.Errors;
using kiedygramy.DTO.Session.List;
using kiedygramy.DTO.Session.Create;
using kiedygramy.DTO.Session.Invitations;
using kiedygramy.DTO.Session.Availability;
using kiedygramy.DTO.Session.Chat;
using kiedygramy.DTO.Session.Votes;
using kiedygramy.DTO.Session.Details;
using kiedygramy.DTO.Session.Pool;



namespace kiedygramy.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/my/sessions")]
    public class SessionsController : ApiControllerBase
    {
        private readonly ISessionService _sessionService;
        private readonly UserManager<User> _userManager;
        private readonly ISessionChatService _sessionChatService;

        protected int GetCurrentUserId()
        {
            var idClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);

            if (idClaim == null)
            {
                throw new UnauthorizedAccessException("Użytkownik nie jest zalogowany.");
            }

            return int.Parse(idClaim.Value);
        }

        public SessionsController(
            ISessionService sessionService,
            UserManager<User> userManager,
            ISessionChatService sessionChatService)
        {
            _sessionService = sessionService;
            _userManager = userManager;
            _sessionChatService = sessionChatService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSessionRequest dto)
        {
            if (!ModelState.IsValid)
                return ValidationProblemFromModelState();

            var userId = GetRequiredUserId();

            var (session, error) = await _sessionService.CreateAsync(dto, userId);

            if (error is not null)
                return Problem(error);

            return CreatedAtAction(nameof(GetById), new { id = session!.Id }, session);
        }

        [HttpPost("{id:int}/respond")]
        public async Task<IActionResult> Respond(int id, [FromBody] RespondToInvitationRequest dto)
        {
            if (!ModelState.IsValid)
                return ValidationProblemFromModelState();

            var userId = GetRequiredUserId();

            var error = await _sessionService.RespondToInviteAsync(id, userId, dto.Accept!.Value);

            if (error is not null)
                return Problem(error);

            return NoContent();
        }

        [HttpPost("{id:int}/invite")]
        public async Task<IActionResult> Invite(int id, [FromBody] InviteUserToSessionRequest dto)
        {
            if (!ModelState.IsValid)
                return ValidationProblemFromModelState();

            var userId = GetRequiredUserId();

            var invited = await _userManager.FindByNameAsync(dto.UsernameOrEmail)
                ?? await _userManager.FindByEmailAsync(dto.UsernameOrEmail);

            if (invited is null)
                return Problem(Errors.Session.InvitedUserNotFound());

            var errorFromService = await _sessionService.InviteAsync(id, invited.Id, userId);

            if (errorFromService is not null)
                return Problem(errorFromService);

            return NoContent();
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var userId = GetRequiredUserId();

            var session = await _sessionService.GetByIdAsync(id, userId);

            if (session is null)
                return NotFound();

            return Ok(session);
        }

        [HttpGet("{id:int}/participants")]
        public async Task<IActionResult> GetParticipants(int id)
        {
            var userId = GetRequiredUserId();

            var (participants, error) = await _sessionService.GetParticipantsAsync(id, userId);

            if (error is not null)
                return Problem(error);

            return Ok(participants);
        }

        [HttpDelete("{sessionId}/participants/{userId}")]
        public async Task<IActionResult> RemoveParticipant(int sessionId, int userId)
        {
            var organizerId = GetCurrentUserId();

            var (participants, error) = await _sessionService.RemoveParticipantAsync(sessionId, organizerId, userId);

            if (error is not null)
                return Problem(error);

            return Ok(participants);
        }

        [HttpGet("invited")]
        public async Task<ActionResult<IEnumerable<SessionListItemResponse>>> GetInvited()
        {
            var userId = GetRequiredUserId();

            var list = await _sessionService.GetInvitedAsync(userId);

            return Ok(list);
        }

        [HttpGet]
        public async Task<IActionResult> GetMine()
        {
            var userId = GetRequiredUserId();

            var list = await _sessionService.GetMineAsync(userId);

            return Ok(list);
        }

        [HttpGet("{id:int}/chat/messages")]
        public async Task<IActionResult> GetMessages(int id, [FromQuery] int? limit, [FromQuery] int? beforeMessageId)
        {
            var userId = GetRequiredUserId();

            var (messages, error) = await _sessionChatService.GetMessagesAsync(id, userId, limit, beforeMessageId);

            if (error is not null)
                return Problem(error);

            return Ok(messages);
        }

        [HttpPost("{id:int}/chat/messages")]
        public async Task<IActionResult> SendMessage(int id, [FromBody] CreateSessionMessageRequest dto, CancellationToken ct)
        {
            if (!ModelState.IsValid)
                return ValidationProblemFromModelState();

            var userId = GetRequiredUserId();

            var (message, error) = await _sessionChatService.AddMessageAsync(id, userId, dto, ct);

            if (error is not null)
                return Problem(error);


            return Ok(message);
        }

        [HttpPost("{id:int}/availability/window")]
        public async Task<IActionResult> SetAvailabilityWindow(int id, [FromBody] SetAvailabilityWindowRequest dto)
        {
            if (!ModelState.IsValid)
                return ValidationProblemFromModelState();

            var userId = GetRequiredUserId();

            var error = await _sessionService.SetAvailabilityWindowAsync(id, userId, dto);

            if (error is not null)
                return Problem(error);

            return NoContent();
        }

        [HttpPut("{id:int}/availability")]
        public async Task<IActionResult> UpdateAvailability(int id, [FromBody] UpdateAvailabilityRequest dto)
        {
            if (!ModelState.IsValid)
                return ValidationProblemFromModelState();

            var userId = GetRequiredUserId();

            var error = await _sessionService.UpdateAvailabilityAsync(id, userId, dto);

            if (error is not null)
                return Problem(error);

            return NoContent();
        }

        [HttpGet("{id:int}/availability/me")]
        public async Task<IActionResult> GetMyAvailability(int id)
        {
            var userId = GetRequiredUserId();

            var (availability, error) = await _sessionService.GetMyAvailabilityAsync(id, userId);

            if (error is not null)
                return Problem(error);


            return Ok(availability ?? new MyAvailabilityResponse(new List<DateTime>()));
        }

        [HttpGet("{id:int}/availability/summary")]
        public async Task<IActionResult> GetAvailabilitySummary(int id)
        {
            try
            {
                var userId = GetRequiredUserId();

                var (summary, error) = await _sessionService.GetAvailabilitySummaryAsync(id, userId);

                if (error is not null)
                    return Problem(error);

                if (summary is null)
                {
                    return Ok(new AvailabilitySummaryResponse(new List<AvailabilitySummaryDayDto>()));
                }

                return Ok(summary);
            }
            catch (Exception ex)
            {
                return Problem(title: "Błąd serwera", detail: ex.Message);
            }
        }

        [HttpPost("{id:int}/final-date")]
        public async Task<IActionResult> SetFinalDate(int id, [FromBody] SetFinalDateRequest dto)
        {
            if (!ModelState.IsValid)
                return ValidationProblemFromModelState();

            var userId = GetRequiredUserId();

            var error = await _sessionService.SetFinalDateAsync(id, userId, dto);

            if (error is not null)
                return Problem(error);

            return NoContent();
        }

        [HttpPut("{id:int}/games")]
        public async Task<IActionResult> SetFinalGames(int id, [FromBody] SetFinalGamesRequest dto)
        {
            // 1. Walidacja podstawowa (czy JSON jest poprawny)
            if (!ModelState.IsValid)
                return ValidationProblemFromModelState();

            // 2. Pobranie ID zalogowanego użytkownika
            var userId = GetRequiredUserId();

            // 3. Wywołanie logiki biznesowej
            var error = await _sessionService.SetFinalGamesAsync(id, userId, dto);

            // 4. Obsługa błędów zwróconych przez serwis
            if (error is not null)
                return Problem(error);

            // 5. Sukces (204 No Content)
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = GetRequiredUserId();
            var error = await _sessionService.DeleteAsync(id, userId);

            if (error is not null)
                return Problem(error);

            return NoContent();
        }

        [HttpGet("{id:int}/game-pool")]
        public async Task<IActionResult> GetGamePool(int id)
        {
            var userId = GetRequiredUserId();

            var (gamePool, error) = await _sessionService.GetConfirmedParticipantsGamesAsync(id, userId);

            if (error is not null)
                return Problem(error);

            return Ok(gamePool);
        }

        [HttpPost("{id:int}/game-pool/votes")]
        public async Task<IActionResult> ToggleGameVote(int id, [FromBody] ToggleGameVoteRequest dto)
        { 
            if(!ModelState.IsValid)
                return ValidationProblemFromModelState();

            var userId = GetRequiredUserId();

            var error = await _sessionService.ToggleGameVoteAsync(id, userId, dto.key);

            if(error is not null)
                return Problem(error);

            return NoContent();
        }
    }
}
