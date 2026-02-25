using Microsoft.AspNetCore.Identity;

namespace kiedygramy.Domain
{
    public class User : IdentityUser<int>
    {         
        public string? FullName { get; set; }       
        public string? City { get; set; }
        public string PrefferedLanguage { get; set; } = "pl";

        public ICollection<UserGame> UserGames { get; set; } = new List<UserGame>();
        public ICollection<Session> OwnedSessions { get; set; } = new List<Session>();
        public ICollection<SessionParticipant> SessionParticipants { get; set; } = new List<SessionParticipant>();

        public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    }
}
