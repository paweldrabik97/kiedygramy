using Microsoft.AspNetCore.Identity;

namespace kiedygramy.Domain
{
    public class User : IdentityUser<int>
    {         
        public string? FullName { get; set; }
        public string? Bio { get; set; }
        public string? City { get; set; }

        public ICollection<Game> Games { get; set; } = new List<Game>();
        public ICollection<Session> Sessions { get; set; } = new List<Session>();
    }
}
