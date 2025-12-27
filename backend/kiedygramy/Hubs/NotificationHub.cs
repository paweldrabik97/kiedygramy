using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace kiedygramy.Hubs
{
    public class NotificationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var userId = GetRequiredUserId();
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId}");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = GetRequiredUserId();
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user-{userId}");
            await base.OnDisconnectedAsync(exception);
        }

        private static string UserGroup(int userId) => $"user-{userId}";

        private int GetRequiredUserId()
        {
            var idValue = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(idValue, out var userId))
                throw new HubException("Invalid User");

            return userId;
        }
    }
}
