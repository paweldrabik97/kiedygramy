using System.ComponentModel.DataAnnotations;

namespace kiedygramy.DTO.Game
{
    public record ImportGameFromExternalDto
    (
        [Required]  
        string SourceId
    );
}
