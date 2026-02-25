using System.ComponentModel.DataAnnotations;

namespace kiedygramy.DTO.Auth
{
    public class UpdateLanguageRequest
    {
        [Required(ErrorMessage ="Language is required")]
        [StringLength(5, MinimumLength = 2, ErrorMessage = "Invalid format")]
        public string Language { get; set; } = null!;
    }
}
