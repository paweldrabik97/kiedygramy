using System.ComponentModel.DataAnnotations;

namespace kiedygramy.DTO.Auth
{
    public record ChangeFullNameDto
    (
        [MaxLength(200)]
        string NewFullName
    );   
}
