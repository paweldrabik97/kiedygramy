namespace kiedygramy.Domain
{
    public class Game
    {       
        public int Id { get; set; }
        public string Title { get; set; } = default!;
        public string? ImageUrl { get; set; }
        public string? PlayTime { get; set; }
        public int MinPlayers { get; set; }
        public int MaxPlayers { get; set; }

        public int OwnerId { get; set; }
        public User Owner { get; set; } = default!;
        public ICollection<Session> Sessions { get; set; } = new List<Session>();

        public ICollection<GameGenre> GameGenres { get; set; } = new List<GameGenre>();
    }
}


