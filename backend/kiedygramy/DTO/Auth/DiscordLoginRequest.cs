namespace kiedygramy.DTO.Auth
{
    public record DiscordLoginRequest
    {
        public string Code { get; init; } = null!;
        public string? Language { get; init; }
    }
}
