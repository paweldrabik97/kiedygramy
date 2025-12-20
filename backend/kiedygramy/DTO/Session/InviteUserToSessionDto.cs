using System.ComponentModel.DataAnnotations;

namespace kiedygramy.DTO.Session
{
    
    public record InviteUserToSessionDto(
        
        [Required]
        string UsernameOrEmail
    );
}