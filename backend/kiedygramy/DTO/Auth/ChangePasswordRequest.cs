using System.ComponentModel.DataAnnotations;

namespace kiedygramy.DTO.Auth
{
    public record ChangePasswordRequest
    (
            [Required]
            string CurrentPassword,

            [Required]
            [MinLength(6)]
            string NewPassword
    );   
}
