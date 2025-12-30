using System.ComponentModel.DataAnnotations;

namespace kiedygramy.DTO.Auth
{
    public record LoginRequest(

        [Required]
        string UsernameOrEmail,

        [Required]
        string Password);
}
