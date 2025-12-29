namespace kiedygramy.Domain
{
    public class SessionGameVote
    { 
        public int Id { get; set; }

        public int SessionId { get; set; }
        public Session Session { get; set; } = default!;

        public int UserId { get; set; }
        public User User { get; set; } = default!;

        public string GameKey { get; set; } = null!; 
    }
}
