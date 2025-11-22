namespace kiedygramy.DTO.Game
{
    public record CreateGameDto( 
       
        string Title,
       string Genre,
       int MinPlayers,
       int MaxPlayers
       );
}
