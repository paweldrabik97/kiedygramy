namespace kiedygramy.DTO.Game
{
    public record GameListItemDto(
        int Id,
        string Title,
        string? Genre,
        int MinPlayers,
        int MaxPlayers
    );
}
