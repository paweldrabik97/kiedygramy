using System.ComponentModel.DataAnnotations;

namespace kiedygramy.DTO.Auth
{
    public record ChangePasswordDto
    (
            [Required]
            string CurrentPassword,

            [Required]
            [MinLength(6)]
            string NewPassword
    );   
}
