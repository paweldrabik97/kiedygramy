using kiedygramy.DTO.Common;
using kiedygramy.DTO.Session;

namespace kiedygramy.Services.Sessions
{
    public interface ISessionService
    {
        Task<(SessionDetailsDto? Session, ErrorResponseDto? Error)> CreateAsync(CreateSessionDto dto, int userId);
        Task<SessionDetailsDto?> GetByIdAsync(int sessionId, int userId);
        Task<IEnumerable<SessionListItemDto>> GetMineAsync(int userId);
        Task<ErrorResponseDto?> InviteAsync(int sessionId, int invitedUserId, int currentUserId);
        Task<ErrorResponseDto?> RespondToInviteAsync(int sessionId, int userId, bool accept);
        Task<(IEnumerable<SessionParticipantDto> Participants, ErrorResponseDto? Error)> GetParticipantsAsync(int sessionId, int userId);
        Task<IEnumerable<SessionListItemDto>> GetInvitedAsync(int userId);
        Task<ErrorResponseDto?> SetAvailabilityWindowAsync(int sessionId, int userId, SetAvailabilityWindowDto dto);
        Task<ErrorResponseDto?> UpdateAvailabilityAsync(int sessionId, int userId, UpdateAvailabilityDto dto);
        Task<(MyAvailabilityDto? Availability, ErrorResponseDto? Error)> GetMyAvailabilityAsync(int sessionId, int userId);
        Task<(AvailabilitySummaryDto? Summary, ErrorResponseDto? Error)> GetAvailabilitySummaryAsync(int sessionId, int userId);
        Task<ErrorResponseDto?> SetFinalDateAsync(int sessionId, int userId, SetFinalDateDto dto);
        Task<ErrorResponseDto?> UpdateAttendanceAsync(int sessionId, int userId, UpdateAttendanceDto dto);
        Task<ErrorResponseDto?> DeleteAsync(int sessionId, int userId);

    }
}
