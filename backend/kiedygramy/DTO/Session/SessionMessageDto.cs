using kiedygramy.Domain;

namespace kiedygramy.DTO.Session
{
    public record SessionMessageDto(
         int Id,
         int UserId,
         string UserName,
         string Text,
         DateTime CreatedAt
     );
    
}
