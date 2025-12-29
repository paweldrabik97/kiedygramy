using System.Security.Cryptography.X509Certificates;

namespace kiedygramy.DTO.Session
{
    public record SessionPoolGameDto
    (     
        int Id,
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
