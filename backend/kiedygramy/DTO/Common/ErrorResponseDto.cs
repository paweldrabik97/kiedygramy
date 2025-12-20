namespace kiedygramy.DTO.Common
{
    public record ErrorResponseDto(
        int status,
        string title,
        string detail,
        string? instance = null,
        IDictionary<string, string[]>? errors = null
        );
}
