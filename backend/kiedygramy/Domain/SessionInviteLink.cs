namespace kiedygramy.Domain
{
    public class SessionInviteLink
    {
        public int Id { get; set; }
        public int SessionId { get; set; }
        public Session Session { get; set; } = null!;
        public string Token { get; set; }
        public DateTime? ExpiresAt { get; set; }
    }
}
