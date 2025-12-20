namespace kiedygramy.DTO.Game
{
    public record GameDetailsDto(
    
        int Id,
        string Title,
        List<string> Genres,
        int MinPlayers,
        int MaxPlayers,
        string? ImageUrl,
        string? PlayTime
    );
}
