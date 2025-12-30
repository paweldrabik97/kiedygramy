using System.Security.Cryptography.X509Certificates;

namespace kiedygramy.DTO.Session.Pool
{
    public record SessionPoolGameItemDto
    (     
        int Id,
        string Title,
        string Key,
        int Count,
        List<string> Owners, 
        string? ImageUrl,
        int? MinPlayers,
        int? MaxPlayers,
        int VotesCount,
        bool hasVoted
    );
    
}
