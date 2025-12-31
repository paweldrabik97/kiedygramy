using kiedygramy.DTO.Common;
using kiedygramy.DTO.Session.Availability;
using kiedygramy.DTO.Session.Create;
using kiedygramy.DTO.Session.Details;
using kiedygramy.DTO.Session.List;
using kiedygramy.DTO.Session.Pool;

namespace kiedygramy.Services.Sessions
{
    public interface ISessionService
    {
        Task<(SessionDetailsResponse? Session, ErrorResponseDto? Error)> CreateAsync(CreateSessionRequest dto, int userId);
        Task<SessionDetailsResponse?> GetByIdAsync(int sessionId, int userId);
        Task<IEnumerable<SessionListItemResponse>> GetMineAsync(int userId);
        Task<ErrorResponseDto?> InviteAsync(int sessionId, int invitedUserId, int currentUserId);
        Task<ErrorResponseDto?> RespondToInviteAsync(int sessionId, int userId, bool accept);
        Task<(IEnumerable<SessionParticipantDto> Participants, ErrorResponseDto? Error)> GetParticipantsAsync(int sessionId, int userId);
        Task<(IEnumerable<SessionParticipantDto> Participants, ErrorResponseDto? Error)> RemoveParticipantAsync(int sessionId, int organizerId, int targetUserId);
        Task<IEnumerable<SessionListItemResponse>> GetInvitedAsync(int userId);
        Task<ErrorResponseDto?> SetAvailabilityWindowAsync(int sessionId, int userId, SetAvailabilityWindowRequest dto);
        Task<ErrorResponseDto?> UpdateAvailabilityAsync(int sessionId, int userId, UpdateAvailabilityRequest dto);
        Task<(MyAvailabilityResponse? Availability, ErrorResponseDto? Error)> GetMyAvailabilityAsync(int sessionId, int userId);
        Task<(AvailabilitySummaryResponse? Summary, ErrorResponseDto? Error)> GetAvailabilitySummaryAsync(int sessionId, int userId);
        Task<ErrorResponseDto?> SetFinalDateAsync(int sessionId, int userId, SetFinalDateRequest dto);
        Task<ErrorResponseDto?> SetFinalGamesAsync(int sessionId, int userId, SetFinalGamesRequest dto);
        Task<ErrorResponseDto?> UpdateAttendanceAsync(int sessionId, int userId, UpdateAttendanceRequest dto);
        Task<ErrorResponseDto?> DeleteAsync(int sessionId, int userId);
        Task<(List<SessionPoolGameItemDto>? GamePool, ErrorResponseDto? Error)> GetConfirmedParticipantsGamesAsync(int sessionId, int userId);
        Task<ErrorResponseDto?> ToggleGameVoteAsync(int sessionId, int userId, string key);
    }
}
