namespace kiedygramy.Domain
{
    public class SessionMessage
    {
        public int Id { get; set; }

        public int SessionId { get; set; }
        public Session Session { get; set; } = null!;

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public string Text { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
    }

}
