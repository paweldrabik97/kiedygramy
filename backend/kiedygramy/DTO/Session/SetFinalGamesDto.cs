namespace kiedygramy.DTO.Session
{
    public record SetFinalGamesDto
    {
        public List<int> GameIds { get; init; } = new();
    }
}
