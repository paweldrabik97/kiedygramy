using System.ComponentModel.DataAnnotations;

namespace kiedygramy.DTO.Auth
{
    public record ChangeCityDto
    (
        [MaxLength(100)]   
        string NewCity   
    );
}
