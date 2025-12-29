using System.ComponentModel.DataAnnotations;

namespace kiedygramy.DTO.Auth
{
    public record ChangeUserNameDto(
        
        [Required]
        [MaxLength(30)]
        [MinLength(3)]
        string NewUserName
    );    
}
