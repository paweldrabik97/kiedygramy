namespace kiedygramy.DTO
{
    public record RegisterDto(string Username, string Email, string Password, string? FullName, string? City);
    public record LoginDto(string UsernameOrEmail, string Password);
    public record MeDto(int Id, string Username, string? Email, string? FullName, string? City);
}
