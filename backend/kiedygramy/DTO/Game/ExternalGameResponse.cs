namespace kiedygramy.DTO.Game
{
    public record ExternalGameResponse(
         string Title,
        List<string> Genres,
        int MinPlayers,
        int MaxPlayers,
        string? ImageUrl,
        string? PlayTime,
        string? SourceId
    );   
}
