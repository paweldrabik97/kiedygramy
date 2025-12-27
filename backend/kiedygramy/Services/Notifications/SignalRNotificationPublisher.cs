using Microsoft.AspNetCore.SignalR;
using kiedygramy.Hubs;
using kiedygramy.DTO.Notifications;

namespace kiedygramy.Services.Notifications
{
    public class SignalRNotificationPublisher : INotificationPublisher
    {
        private readonly IHubContext<NotificationHub> _hub;

        public SignalRNotificationPublisher(IHubContext<NotificationHub> hub)
        {
            _hub = hub;
        }

        private static string UserGroup(int userId) => $"user-{userId}";

        public Task NotificationUpsertedAsync(int userId, NotificationDto dto, CancellationToken ct) =>
            _hub.Clients.Group(UserGroup(userId)).SendAsync("NotificationUpserted", dto, ct);

        public Task UnreadCountUpdatedAsync(int userId, int unreadCount, CancellationToken ct) =>
            _hub.Clients.Group(UserGroup(userId)).SendAsync("UnreadCountUpdated", new { unreadCount }, ct);

    }
}
