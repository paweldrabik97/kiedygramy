using System.ComponentModel.DataAnnotations;

namespace kiedygramy.DTO.Session
{
    public record RespondToInvitationDto(

        [Required]
        bool? Accept
    );
   
}
