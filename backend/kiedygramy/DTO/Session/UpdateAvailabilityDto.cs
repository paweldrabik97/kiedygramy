using System.ComponentModel.DataAnnotations;

namespace kiedygramy.DTO.Session
{
    public record UpdateAvailabilityDto(
        [Required(ErrorMessage ="Lista dat jest wymagana")]
        List<DateTime> Dates  
    );   
}
