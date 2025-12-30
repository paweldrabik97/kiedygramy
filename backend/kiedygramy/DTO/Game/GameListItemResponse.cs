namespace kiedygramy.DTO.Game
{
    public record GameListItemResponse(
        int Id,
        string Title,
        List<string> Genre,
        int MinPlayers,
        int MaxPlayers,
        string? ImageUrl,
        string? PlayTime
    );
}
