using kiedygramy.Domain.Enums;
using kiedygramy.DTO.Common;
using kiedygramy.DTO.Notifications;
using kiedygramy.Domain;

namespace kiedygramy.Services.Notifications
{
    public interface INotificationService
    {
        Task<List<NotificationDto>> GetMyAsync(int userId, bool unreadOnly, int take, CancellationToken  ct);
        Task<int> GetMyUnreadCountAsync(int userId, CancellationToken ct);
        Task<ErrorResponseDto?> MarkAsReadAsync(int userId, int notificationId, CancellationToken ct);
        Task<(Notification? notification, ErrorResponseDto? error)> CreateAsync(int userId, NotificationType type, string title, string? message, string? url, int? sessionId, string? key, CancellationToken ct);
        Task<(Notification? Notification, ErrorResponseDto? Error)> UpsertChatCounterAsync(int userId, int sessionId, string sessionTitle, string lastMessagePreview, CancellationToken ct );
        Task<ErrorResponseDto?> MarkChatAsReadAsync(int userId, int sessionId, CancellationToken ct);
        
    }
}
