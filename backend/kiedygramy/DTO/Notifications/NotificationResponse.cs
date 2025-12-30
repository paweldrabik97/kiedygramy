using kiedygramy.Domain.Enums;

namespace kiedygramy.DTO.Notifications
{
    public record NotificationResponse(
        
        int Id,
        NotificationType Type,
        int? SessionId,
        string Title,
        string? Message,
        string? Url,
        int Count,
        bool IsRead,
        DateTime CreatedAt,
        DateTime UpdatedAt,
        DateTime? ReadAt
    );
}
