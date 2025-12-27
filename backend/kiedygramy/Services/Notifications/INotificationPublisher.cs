using kiedygramy.DTO.Notifications;

namespace kiedygramy.Services.Notifications
{
    public interface INotificationPublisher
    {
        Task NotificationUpsertedAsync(int userId, NotificationDto dto, CancellationToken ct);
        Task UnreadCountUpdatedAsync(int userId, int unreadCount, CancellationToken ct);
    }
}
