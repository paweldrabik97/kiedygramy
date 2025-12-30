namespace kiedygramy.DTO.Auth
{
    public record MeResponse(
        
        int Id,
        string Username,
        string? Email,
        string? FullName,
        string? City
    );
}
