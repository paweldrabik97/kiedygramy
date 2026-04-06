using kiedygramy.Controllers.Base;
using kiedygramy.DTO.Common;
using kiedygramy.DTO.Guest;
using kiedygramy.Services.Guest;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace kiedygramy.Controllers
{
    [ApiController]
    [Route("api/guest")]
    public class GuestController : ApiControllerBase
    {
        private readonly IGuestService _guestService;
        private readonly ILogger<GuestController> _logger;
       
        public GuestController(IGuestService guestService, ILogger<GuestController> logger)
        {
            _guestService = guestService;
            _logger = logger;
        }

        [AllowAnonymous]
        [HttpPost("join-as-guest")]
        public async Task<IActionResult> JoinAsGuest([FromQuery] string token, [FromBody]JoinAsGuestRequest dto)
        {

            if (!ModelState.IsValid)
                return ValidationProblemFromModelState();

            var idClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);         

            if (idClaim is not null)
            {
                var userId = int.Parse(idClaim.Value);
                var error = await _guestService.JoinAsRegisteredUserAsync(token, userId);

                if (error != null)
                    return Problem(error);

                return NoContent();
            }
                
            var (error2, guestResponse) = await _guestService.JoinAsGuestAsync(token, dto.guestName);
            
            if (error2 is not null)
                return Problem(error2);

            return Ok(guestResponse);
        }

        [AllowAnonymous]
        [HttpPost("rejoin-as-guest")]
        public async Task<IActionResult> RejoinAsGuest([FromBody]RejoinAsGuestRequest dto)
        {
            if (!ModelState.IsValid)
                return ValidationProblemFromModelState();

            var error = await _guestService.RejoinAsGuestAsync(dto.guestCode);

            if (error != null) 
                return Problem(error);

            return NoContent();
        }

        [Authorize]
        [HttpPost("{sessionId:int}/generate-invite-link")]
        public async Task<IActionResult> GenerateInviteLink( int sessionId)
        {
            if (!ModelState.IsValid)
                return ValidationProblemFromModelState();

            var userId = GetRequiredUserId();

            var (error, link) = await _guestService.GenerateInviteLinkAsync(sessionId, userId);

            if (error != null)
                return Problem(error);

            return Ok(link);
        }

    }
}
