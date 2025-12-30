using System.ComponentModel.DataAnnotations;

namespace kiedygramy.DTO.Auth
{
    public record ChangeCityRequest
    (
        [MaxLength(100)]   
        string NewCity   
    );
}
