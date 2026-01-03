using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using kiedygramy.Services.Chat;
using kiedygramy.Services.Notifications;

namespace kiedygramy.Hubs
{
    [Authorize]
    public class SessionChatHub : Hub
    {
        private readonly ISessionChatHubService _chatHubService;
        private readonly INotificationService _notificationService;
        private readonly ILogger<SessionChatHub> _logger;

        public SessionChatHub(ISessionChatHubService chatHubService, INotificationService notificationService, ILogger<SessionChatHub> logger)
        {
            _chatHubService = chatHubService;
            _notificationService = notificationService;
            _logger = logger;
        }

        private static string GroupName(int sessionId) => $"session-{sessionId}";

        public async Task JoinSessionGroup(int sessionId)
        {

            Console.WriteLine($"[HUB] Klient {Context.ConnectionId} dodawany do grupy: '{GroupName(sessionId)}'");
            var userId = GetRequiredUserId();

            var error = await _chatHubService.ValidateJoinAsync(sessionId, userId, CancellationToken.None);

            if (error is not null)
                HubErrorThrower.Throw(error);

           

            await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(sessionId), CancellationToken.None);

            try
            {
               var error2 = await _notificationService.MarkChatAsReadAsync(userId, sessionId, CancellationToken.None);
                
               if (error2 is not null)
               { 
                    _logger.LogWarning("Notification to mark chat as read was not found for userId={UserId}, sessionId={SessionId}", userId, sessionId);
                    return;
               }

               var userKey = userId.ToString();

               await Clients.Caller.SendAsync("ChatNotificationRead", new { sessionId }, CancellationToken.None);
            }
            catch(Exception ex)
            {                         
                _logger.LogError(ex, "Failed to mark chat as read for userId={UserId}, sessionId={SessionId}", userId, sessionId);
            }
        }

        public async Task LeaveSessionGroup(int sessionId, CancellationToken ct)
            => await Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupName(sessionId), ct);
        
        private int GetRequiredUserId()
        {
            var idValue = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(idValue, out var userId))
                throw new HubException("Invalid User");

            return userId;
        }       
    }
}
