namespace kiedygramy.DTO.Game
{
    public record UpdateGameDto( 
       
        string Title,
       string Genre,
       int MinPlayers,
       int MaxPlayers);
}
