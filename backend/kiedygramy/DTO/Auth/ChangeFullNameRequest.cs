using System.ComponentModel.DataAnnotations;

namespace kiedygramy.DTO.Auth
{
    public record ChangeFullNameRequest
    (
        [MaxLength(200)]
        string NewFullName
    );   
}
