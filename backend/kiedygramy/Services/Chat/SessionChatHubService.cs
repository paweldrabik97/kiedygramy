using kiedygramy.Application.Errors;
using kiedygramy.Data;
using kiedygramy.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using kiedygramy.DTO.Common;

namespace kiedygramy.Services.Chat
{
    public class SessionChatHubService : ISessionChatHubService
    {
        private readonly AppDbContext _db;

        public SessionChatHubService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<ErrorResponseDto> ValidateJoinAsync(int sessionId, int userId, CancellationToken ct)
        {
            var hasAccess = await _db.Sessions
                .AsNoTracking()
                .AnyAsync(s =>
                    s.Id == sessionId &&
                    (s.OwnerId == userId ||
                     s.Participants.Any(p => p.UserId == userId && p.Status == SessionParticipantStatus.Confirmed)),
                    ct);

            if (!hasAccess)
                return Errors.Hub.SessionChatForbidden();

            return null;
        }
    }
}
