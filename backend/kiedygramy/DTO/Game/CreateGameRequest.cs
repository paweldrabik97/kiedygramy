using System.ComponentModel.DataAnnotations;

namespace kiedygramy.DTO.Game
{
    public record CreateGameRequest(

       [Required(ErrorMessage ="Tytuł jest wymagany")]
       [MaxLength(100, ErrorMessage ="Tytuł może mieć max 100 znaków")]
        string Title,

       List<int> GenreIds,

       [Range(1, 20, ErrorMessage = "Liczba graczy musi być między 1 - 20")]
       int MinPlayers,

         [Range(1, 20, ErrorMessage = "Liczba graczy musi być między 1 - 20")]
       int MaxPlayers,

        string? ImageUrl,
         string? PlayTime
       );
}
