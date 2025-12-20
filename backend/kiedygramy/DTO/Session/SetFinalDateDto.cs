using System.ComponentModel.DataAnnotations;

namespace kiedygramy.DTO.Session
{ 
    public record SetFinalDateDto(
        
        [Required(ErrorMessage ="Data i godzina jest wymagana")]
        DateTime DateTime
    );
}
