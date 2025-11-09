namespace kiedygramy.DTO
{
   public record CreateUserDto(string UserName,
       string Email,
       string? FullName, 
       string? City,
       string? Bio);
   
    public record CreateGameDto( string Title,
       string Genre,
       int MinPlayers,
       int MaxPlayers,
       int OwnerId);

    public record CreateSessionDto(string Title,
       DateTime Date,
       string Location,
       int GameId);
}
