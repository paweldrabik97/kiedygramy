namespace kiedygramy.DTO.Auth
{
    public record GoogleLoginRequest
    {
        public string Credential { get; init; } = null!;
        public string? Language { get; init; }
    }
}
