using System.ComponentModel.DataAnnotations;

namespace kiedygramy.DTO.Session.Invitations
{
    public record RespondToInvitationRequest(

        [Required]
        bool? Accept
    );
   
}
