using System.ComponentModel.DataAnnotations;

namespace kiedygramy.DTO.Session
{
    public record CreateSessionDto(

       [Required(ErrorMessage = "Tytuł jest wymagany")]
       [MaxLength(100, ErrorMessage = "Tytuł może mieć maksymalnie 100 znaków")]
       string Title,

       DateTime? Date,

       [MaxLength(200, ErrorMessage = "Lokalizacja może mieć maksymalnie 200 znaków")]
       string? Location,

       [MaxLength(500, ErrorMessage = "Opis może mieć maksymalnie 500 znaków")]
       string? Description,

       int[]? GameIds
    );
}
