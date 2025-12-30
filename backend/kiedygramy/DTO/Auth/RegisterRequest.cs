using System.ComponentModel.DataAnnotations;

namespace kiedygramy.DTO.Auth
{
    public record RegisterRequest(

        [Required]
        [MaxLength(30)]
        [MinLength(3)]
        string Username,

        [Required]
        [EmailAddress]
        [MaxLength(256)]
        string Email,

        [Required]
        [MinLength(6)]
        string Password,

        [MaxLength(200)]
        string? FullName,

        [MaxLength(100)]
        string? City
    );
}
