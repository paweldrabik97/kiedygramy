using Microsoft.AspNetCore.Mvc;

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

        public ICollection<Game> Games { get; set; } = new List<Game>();

        public ICollection<SessionParticipant> Participants { get; set; } = new List<SessionParticipant>();

        public ICollection<SessionMessage> Messages { get; set; } = new List<SessionMessage>();

        public DateTime? AvailabilityFrom { get; set; }
        public DateTime? AvailabilityTo { get; set; }
        public DateTime? AvailabilityDeadline { get; set; }

        public ICollection<SessionAvailability> Availabilities { get; set; } = new List<SessionAvailability>();
    }
}
