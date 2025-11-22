using kiedygramy.DTO.Common;
using kiedygramy.DTO.Session;

namespace kiedygramy.Services.Sessions
{
    public interface ISessionService
    {
        Task<(SessionDetailsDto? Session, ErrorResponseDto? Error)> CreateAsync(CreateSessionDto dto, int userId);
        Task<SessionDetailsDto?> GetByIdAsync(int sessionId, int userId);
        Task<IEnumerable<SessionListItemDto>> GetMineAsync(int userId);
    }
}
