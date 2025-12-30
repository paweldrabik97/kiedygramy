namespace kiedygramy.DTO.Session.Details
{
    public record SessionAvailableGameDto(
        
        int GameId,
        string Title,
        List<string> Genre,
        int MinPlayers,
        int MaxPlayers,
        string? ImageUrl,
        string? PlayTime,
        int OwnerId,
        string Username

    );  
}
