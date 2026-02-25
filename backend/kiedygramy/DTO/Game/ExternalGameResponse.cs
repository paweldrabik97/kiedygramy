namespace kiedygramy.DTO.Game
{
    public record ExternalGameResponse(
         string Title,
        string DisplayTitle,
        List<string> Genres,
        int MinPlayers,
        int MaxPlayers,
        string? ImageUrl,
        string? PlayTime,
        string? SourceId
    );   
}
