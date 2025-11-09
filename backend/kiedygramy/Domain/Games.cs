namespace kiedygramy.Domain
{
    public class Game
    {
        public int Id { get; set; }
        public string Title { get; set; } = default!;
        public string Genre { get; set; }
        public int MinPlayers { get; set; }
        public int MaxPlayers { get; set; }
        public int OwnerId { get; set; }
        public User Owner { get; set; } = default!;

    }
}
