using System.ComponentModel.DataAnnotations;

namespace kiedygramy.DTO.Session.Availability
{
    public record UpdateAvailabilityRequest(

        [Required(ErrorMessage ="Lista dat jest wymagana")]
        List<DateTime> Dates  

    );   
}
