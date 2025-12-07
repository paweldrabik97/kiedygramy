namespace kiedygramy.Domain
{
    public class SessionAvailability
    {
        public int Id { get; set;}
        public int SessionId { get; set;}
        public Session Session { get; set;}

        public int UserId { get; set;}
        public User User { get; set; } = default!;
        public DateTime Date { get; set; }
    }
}
