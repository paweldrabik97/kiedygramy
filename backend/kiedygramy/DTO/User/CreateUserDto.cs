namespace kiedygramy.DTO.User
{
    public record CreateUserDto(string UserName,
       string Email,
       string? FullName,
       string? City,
       string? Bio);
}
