using System.ComponentModel.DataAnnotations;

namespace kiedygramy.DTO.Game
{
    public record ImportGameFromExternalRequest
    (
        [Required]  
        string SourceId,
        string? LocalTitle
    );
}
