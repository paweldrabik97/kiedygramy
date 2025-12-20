using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using kiedygramy.Data;
using kiedygramy.Controllers.Base;
using kiedygramy.Domain.Enums;

namespace kiedygramy.Hubs
{
    [Authorize]
    public class SessionChatHub : Hub
    {
        private readonly AppDbContext _db;

        public SessionChatHub(AppDbContext db)
        {
            _db = db;
        }

        public async Task JoinSessionGroup(int sessionId)
        {
            var userId = GetRequiredUserId();

            var hasAccess = await CanAccessChat(sessionId, userId);
            if (!hasAccess)
            {
                
                throw new HubException("Brak dostępu do czatu tej sesji.");
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, $"session-{sessionId}");
        }

        public async Task LeaveSessionGroup(int sessionId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"session-{sessionId}");
        }

        private int GetRequiredUserId()
        {
            var idValue = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(idValue, out var userId))
                throw new HubException("Nieprawidłowy użytkownik.");

            return userId;
        }
        private Task<bool> CanAccessChat(int sessionId, int userId)
        {
            return _db.Sessions
                .AsNoTracking()
                .Where(s => s.Id == sessionId)
                .Select(s =>
                    s.OwnerId == userId ||
                    s.Participants.Any(p =>
                        p.UserId == userId &&
                        p.Status == SessionParticipantStatus.Confirmed))
                .FirstOrDefaultAsync();
        }
    }
}
