namespace kiedygramy.Domain
{
    public class UserGame
    {
        public int UserId { get; set; }
        public User User { get; set; } = default!;
        public int GameId { get; set; }
        public Game Game { get; set; } = default!;
        public string? LocalTitle { get; set; }
        public int Rating { get; set; }
        public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    }
}
