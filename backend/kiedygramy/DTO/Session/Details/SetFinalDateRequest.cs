using System.ComponentModel.DataAnnotations;

namespace kiedygramy.DTO.Session.Details
{ 
    public record SetFinalDateRequest(
        
        [Required(ErrorMessage ="Data i godzina jest wymagana")]
        DateTime DateTime

    );
}
