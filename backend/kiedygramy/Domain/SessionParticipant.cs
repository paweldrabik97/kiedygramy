namespace kiedygramy.Domain
{
    public class SessionParticipant
    {
        public int Id { get; set; }

        public int SessionId { get; set; }
        public Session Session { get; set; } = default!;

        public int UserId { get; set; }
        public User User { get; set; } = default!;

        public string Role { get; set; } = "Gracz";

        public string Status { get; set; } = "Zaproszony";
    }
}
