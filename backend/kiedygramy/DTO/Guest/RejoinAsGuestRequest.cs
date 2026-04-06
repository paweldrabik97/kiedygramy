using System.ComponentModel.DataAnnotations;

namespace kiedygramy.DTO.Guest
{
    public record RejoinAsGuestRequest([Required]string guestCode);
    
}
