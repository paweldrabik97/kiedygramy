namespace kiedygramy.DTO.Auth
{
    public record RegisterDto(string Username, string Email, string Password, string? FullName, string? City);
}
