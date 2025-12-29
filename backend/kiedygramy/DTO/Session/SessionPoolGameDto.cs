namespace kiedygramy.DTO.Session
{
    public record SessionPoolGameDto
    (     
        string Title,
        string Key,
        int Count,
        List<String> Owners, 
        string? ImageUrl,
        int? MinPlayers,
        int? MaxPlayers,
        int VotesCount,
        bool hasVoted
    );
    
}
