namespace kiedygramy.DTO.Game
{
    public record GameListItemResponse(
        int Id,
        string Title,
        string? LocalTitle,
        List<string> Genre,
        int MinPlayers,
        int MaxPlayers,
        string? ImageUrl,
        string? PlayTime,
        int Rating,
        bool IsCustom
    );
}
