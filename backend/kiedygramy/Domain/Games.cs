namespace kiedygramy.Domain
{
    public class Game
    {       
        public int Id { get; set; }
        public int? BggId { get; set; }
        public string Title { get; set; } = default!;
        public string? ImageUrl { get; set; }
        public string? PlayTime { get; set; }
        public int MinPlayers { get; set; }
        public int MaxPlayers { get; set; }
        public bool IsCustom { get; set; } = false;
        public int? CreatedById { get; set; }

        [System.Text.Json.Serialization.JsonIgnore]
        public ICollection<Session> Sessions { get; set; } = new List<Session>();

        public ICollection<GameGenre> GameGenres { get; set; } = new List<GameGenre>();
        public ICollection<UserGame> UserGames { get; set; } = new List<UserGame>();
    }
}


