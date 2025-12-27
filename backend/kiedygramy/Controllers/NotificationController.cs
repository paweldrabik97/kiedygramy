using kiedygramy.Controllers.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using kiedygramy.Services.Notifications;
using kiedygramy.DTO.Notifications;

namespace kiedygramy.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationController : ApiControllerBase
    {
        private readonly INotificationService _notification;

        public NotificationController(INotificationService notification)
        {
            _notification = notification;
        }

        [HttpGet]
        public async Task<ActionResult<List<NotificationDto>>> GetMy([FromQuery] bool unreadOnly = false, [FromQuery] int take = 50, CancellationToken ct = default)
        {
            var userId = GetRequiredUserId();

            var result = await _notification.GetMyAsync(userId, unreadOnly, take, ct);
            return Ok(result);
        }

        [HttpGet("unread-count")]
        public async Task<ActionResult<int>> GetUnreadCount(CancellationToken ct = default)
        {
            var userId = GetRequiredUserId();

            var count = await _notification.GetMyUnreadCountAsync(userId, ct);
            return Ok(count);
        }

        [HttpPost("{id:int}/read")]
        public async Task<IActionResult> MarkAsRead([FromRoute] int id, CancellationToken ct = default)
        {
            var userId = GetRequiredUserId();

            var error = await _notification.MarkAsReadAsync(userId, id, ct);
            if (error is not null)
                return Problem(error);

            return NoContent();
        }

        [HttpPost("sessions/{sessionId:int}/chat-read")]
        public async Task<IActionResult> MarkChatAsRead([FromRoute] int sessionId, CancellationToken ct = default)
        {
            var userId = GetRequiredUserId();

            var error = await _notification.MarkChatAsReadAsync(userId, sessionId, ct);
            if (error is not null)
                return Problem(error);

            return NoContent();
        }

    }

       
}
