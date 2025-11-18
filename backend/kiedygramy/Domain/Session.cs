namespace kiedygramy.Domain
{
    public class Session
    {
        public int Id { get; set; }      
        public string Title { get; set; } = default!;
        public DateTime? Date { get; set; }
        public string? Location { get; set; } = default!;
        public string? Description { get; set; } = default!;

        public int OwnerId { get; set; }
        public User Owner { get; set; } = default!; 


        public int? GameId { get; set; }
        public Game Game { get; set; } = default!;

        public ICollection<SessionParticipant> Participants { get; set; } = new List<SessionParticipant>();
    }
}
