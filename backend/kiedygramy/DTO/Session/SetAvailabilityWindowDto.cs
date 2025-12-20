using System.ComponentModel.DataAnnotations;

namespace kiedygramy.DTO.Session
{
    public record SetAvailabilityWindowDto(

     [Required(ErrorMessage = "Data początkowa jest wymagana")] 
     DateTime From,

     [Required(ErrorMessage = "Data końcowa jest wymagana")]
     DateTime To,

     [Required(ErrorMessage = "Termin na zgłaszanie dostępności jest wymagane")]
     DateTime Deadline 
        );  
}
