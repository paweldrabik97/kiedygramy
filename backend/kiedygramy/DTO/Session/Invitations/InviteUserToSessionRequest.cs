using System.ComponentModel.DataAnnotations;

namespace kiedygramy.DTO.Session.Invitations
{
    
    public record InviteUserToSessionRequest(
        
        [Required]
        string UsernameOrEmail

    );
}