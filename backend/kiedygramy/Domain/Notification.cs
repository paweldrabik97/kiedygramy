using kiedygramy.Domain.Enums;

namespace kiedygramy.Domain
{
    public class Notification
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public NotificationType Type { get; set; }

        public string? Key { get; set; } //  to będzie do agrgacji który chat która sesja 

        public int? SessionId { get; set; }
        public string Title { get; set; } = null!;
        public string Message { get; set; } = null!;
        public string? Url { get; set; }

        public int Count { get; set; } = 1; // do liczenia wiadomości 

        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow; // też do agregacji 
        public DateTime? ReadAt { get; set; }
    }
}
