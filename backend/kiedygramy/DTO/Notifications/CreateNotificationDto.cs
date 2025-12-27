using kiedygramy.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace kiedygramy.DTO.Notifications
{
    public record CreateNotificationDto(

        [Required]
        NotificationType Type,

        int? SessionId,

        [Required , MaxLength(200)]
        string Title,

        [MaxLength(1000)]
        string? Message,

        [MaxLength(500)]
        string? Url
    );   
}
