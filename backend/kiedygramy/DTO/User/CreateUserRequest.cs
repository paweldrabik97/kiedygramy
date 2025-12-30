namespace kiedygramy.DTO.User
{
    public record CreateUserRequest(string UserName,
       string Email,
       string? FullName,
       string? City,
       string? Bio);
}
