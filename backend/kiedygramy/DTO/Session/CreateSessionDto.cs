namespace kiedygramy.DTO.Session
{
    public record CreateSessionDto(
        
       string Title,
       DateTime? Date,
       string? Location,
       string? Description,
       int? GameId
    );
}
