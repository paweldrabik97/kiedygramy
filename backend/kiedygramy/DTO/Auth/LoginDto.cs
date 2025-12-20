using System.ComponentModel.DataAnnotations;

namespace kiedygramy.DTO.Auth
{
    public record LoginDto(

        [Required]
        string UsernameOrEmail,

        [Required]
        string Password);
}
