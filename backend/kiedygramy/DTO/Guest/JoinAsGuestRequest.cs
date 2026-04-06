using System.ComponentModel.DataAnnotations;

namespace kiedygramy.DTO.Guest
{
    public record JoinAsGuestRequest([Required] [MinLength(2)][MaxLength(20)] string guestName);
    
}
