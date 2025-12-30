namespace kiedygramy.DTO.Session.Pool
{
    public record SetFinalGamesRequest
    {
        public List<int> GameIds { get; init; } = new();
    }
}
