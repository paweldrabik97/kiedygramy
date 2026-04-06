using System.ComponentModel.DataAnnotations;

namespace kiedygramy.DTO.Auth
{
    public record UpdateLanguageRequest
    {
        [Required(ErrorMessage ="Language is required")]
        [StringLength(5, MinimumLength = 2, ErrorMessage = "Invalid format")]
        public string Language { get; init; } = null!;
    }
}
