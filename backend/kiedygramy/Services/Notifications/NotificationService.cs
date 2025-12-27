using kiedygramy.Data;
using kiedygramy.Domain;
using kiedygramy.DTO.Common;
using kiedygramy.DTO.Notifications;
using kiedygramy.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using kiedygramy.Application.Errors;

namespace kiedygramy.Services.Notifications
{
    public class NotificationService : INotificationService
    {
        private readonly AppDbContext _db;
        private readonly INotificationPublisher _notificationPublisher;

        public NotificationService(AppDbContext db, INotificationPublisher notificationPublisher)
        {
            _db = db;
            _notificationPublisher = notificationPublisher;
        }

        public async Task<List<NotificationDto>> GetMyAsync(int userId, bool unreadOnly, int take, CancellationToken ct)
        {
            if (take < 1) take = 20;
            if (take > 100) take = 100;

            var query = _db.Notifications.Where(n => n.UserId == userId);

            return await query
               .OrderByDescending(n => n.UpdatedAt)
               .Take(take)
               .Select(n => new NotificationDto(
                   n.Id,
                   n.Type,
                   n.SessionId,
                   n.Title,
                   n.Message,
                   n.Url,
                   n.Count,
                   n.IsRead,
                   n.CreatedAt,
                   n.UpdatedAt,
                   n.ReadAt
               ))
               .ToListAsync(ct);
        }

        public Task<int> GetMyUnreadCountAsync(int userId, CancellationToken ct)
        {
            return _db.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead, ct);
        }

        public async Task<ErrorResponseDto?> MarkAsReadAsync(int userId, int nitoficationId, CancellationToken ct)
        {
            var notification = await _db.Notifications.FirstOrDefaultAsync(n => n.Id == nitoficationId && n.UserId == userId, ct);

            if (notification is null)
                return Errors.Notifications.NotificationNotExists();

            if (!notification.IsRead)
            {
                notification.IsRead = true;
                notification.ReadAt = DateTime.UtcNow;
                notification.Count = 0;
                notification.UpdatedAt = DateTime.UtcNow;

                await _db.SaveChangesAsync(ct);
                await PublishNotificationAsync(userId, notification, ct);
            }

            return null;
        }

        public async Task<ErrorResponseDto?> MarkChatAsReadAsync(int userId, int sessionId, CancellationToken ct)
        {
            var key = $"chat:{sessionId}";

            var notification = await _db.Notifications.FirstOrDefaultAsync(n => n.UserId == userId && n.Key == key, ct);

            if (notification is null)
                return null;

            if (!notification.IsRead || notification.Count != 0)
            {
                notification.IsRead = true;
                notification.ReadAt = DateTime.UtcNow;
                notification.Count = 0;
                notification.UpdatedAt = DateTime.UtcNow;

                await _db.SaveChangesAsync(ct);
                await PublishNotificationAsync(userId, notification, ct);
            }

            return null;
        }

        public async Task<(Notification? notification, ErrorResponseDto? error)> CreateAsync(int userId, NotificationType type, string title, string? message, string? url, int? sessionId, string? key, CancellationToken ct)
        {
            if (userId <= 0)
                return (null, Errors.Notifications.InvalidUserId());

            if (string.IsNullOrWhiteSpace(title))
                return (null, Errors.Notifications.TitleRequired());

            var now = DateTime.UtcNow;

            var notification = new Notification
            {
                UserId = userId,
                Type = type,
                Title = title,
                Message = message!,
                Url = url,
                SessionId = sessionId,
                Key = key,
                Count = 1,
                IsRead = false,
                CreatedAt = now,
                UpdatedAt = now
            };

            _db.Notifications.Add(notification);

            await _db.SaveChangesAsync(ct);
            await PublishNotificationAsync(userId, notification, ct);

            return (notification, null);
        }

        public async Task<(Notification? Notification, ErrorResponseDto? Error)> UpsertChatCounterAsync(int userId, int sessionId, string sessionTitle, string lastMessagePreview, CancellationToken ct)
        {
            if (userId <= 0)
                return (null, Errors.Notifications.InvalidUserId());

            if (sessionId <= 0)
                return (null, Errors.Notifications.InvalidSessionId());

            var now = DateTime.UtcNow;
            var key = $"chat:{sessionId}";

            var existing = await _db.Notifications
                .FirstOrDefaultAsync(n => n.UserId == userId && n.Key == key, ct);

            if (existing is null)
            {
                var notification = new Notification
                {
                    UserId = userId,
                    Type = NotificationType.ChatNewMessage,
                    Key = key,
                    SessionId = sessionId,
                    Title = $"Sesja: {sessionTitle} — nowe wiadomości",
                    Message = lastMessagePreview,
                    Url = $"/sessions/{sessionId}/chat",
                    Count = 1,
                    IsRead = false,
                    CreatedAt = now,
                    UpdatedAt = now
                };

                _db.Notifications.Add(notification);
                await _db.SaveChangesAsync(ct);
                await PublishNotificationAsync(userId, notification, ct);

                return (notification, null);
            }

            existing.Title = $"Sesja: {sessionTitle} — nowe wiadomości";
            existing.Message = lastMessagePreview;
            existing.Url = $"/sessions/{sessionId}/chat";
            existing.Count = existing.IsRead ? 1 : existing.Count + 1;
            existing.IsRead = false;
            existing.ReadAt = null;
            existing.UpdatedAt = now;

            await _db.SaveChangesAsync(ct);
            await PublishNotificationAsync(userId, existing, ct);

            return (existing, null);
        }

        private async Task PublishNotificationAsync(int userId, Notification notification, CancellationToken ct)
        {
            try
            {
                var dto = MapToDto(notification);
                await _notificationPublisher.NotificationUpsertedAsync(userId, dto, ct);

                var unreadCount = await GetMyUnreadCountAsync(userId, ct);
                await _notificationPublisher.UnreadCountUpdatedAsync(userId, unreadCount, ct);
            }
            catch
            {
                // pomijamy błędy publikacji powiadomień głownna logika aplikacji powinna działąć poprawnie bez powiadomień
                // Można tu dodać jakiś log błedu w przyszłości
            }
        }

        public static NotificationDto MapToDto(Notification n)
        { 
            return new NotificationDto(
                Id: n.Id,
                Type: n.Type,
                Title: n.Title,
                Message: n.Message,
                Url: n.Url,
                SessionId: n.SessionId,
                Count: n.Count,
                IsRead: n.IsRead,
                CreatedAt: n.CreatedAt,
                ReadAt: n.ReadAt,
                UpdatedAt: n.UpdatedAt
            );
        }
    }
}
