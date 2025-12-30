using kiedygramy.Data;
using kiedygramy.Domain;
using kiedygramy.DTO.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using kiedygramy.Hubs;
using kiedygramy.Application.Errors;
using kiedygramy.Domain.Enums;
using kiedygramy.Services.Notifications;
using kiedygramy.DTO.Session.Chat;


namespace kiedygramy.Services.Chat
{
    public class SessionChatService : ISessionChatService
    {
        private readonly AppDbContext _db;
        private readonly IHubContext<SessionChatHub> _hubContext;
        private readonly INotificationService _notification;
        private readonly ILogger<SessionChatService> _logger;

        public SessionChatService(AppDbContext db, IHubContext<SessionChatHub> hubContext, INotificationService notification, ILogger<SessionChatService> logger)
        {
            _db = db;
            _hubContext = hubContext;
            _notification = notification;
            _logger = logger;
        }

        public async Task<(SessionMessageResponse? Message, ErrorResponseDto? Error)> AddMessageAsync(int sessionId, int userId, CreateSessionMessageRequest dto, CancellationToken ct)
        {
            var session = await _db.Sessions
                .AsNoTracking()
                .Include(s => s.Participants)
                .FirstOrDefaultAsync(s => s.Id == sessionId, ct);

            if (session is null)
                return (null, Errors.Chat.NotFound());

            var isParticipant = session.OwnerId == userId ||
                session.Participants.Any(p => p.UserId == userId &&
                p.Status == SessionParticipantStatus.Confirmed);

            if (!isParticipant)
                return (null, Errors.Chat.InvalidParticipant());

            var now = DateTime.UtcNow;

            var text = dto.Text.Trim();

            if(text.Length == 0)
                return (null, Errors.Chat.EmptyMessage());

            var message = new SessionMessage
            {
                SessionId = sessionId,
                UserId = userId,
                Text = text,
                CreatedAt = now
            };

            _db.SessionMessages.Add(message);
            await _db.SaveChangesAsync(ct);
            
            var user = await _db.Users
               .AsNoTracking()
               .FirstAsync(u => u.Id == userId, ct);

            var messageDto = new SessionMessageResponse(
               message.Id,
               message.UserId,
               user.UserName!,
               message.Text,
               message.CreatedAt

           );

            await _hubContext.Clients
               .Group($"session-{sessionId}")
               .SendAsync("NewSessionMessage", messageDto, ct);

            try
            {
                var recipientIds = session.Participants
                   .Where(p => p.Status == SessionParticipantStatus.Confirmed)
                   .Select(p => p.UserId)
                   .Append(session.OwnerId)
                   .Distinct()
                   .Where(id => id != userId)
                   .ToList();

                var preview = text.Length <= 120 ? text : text[..120] + "...";
                var sessionTitle = session.Title;

                foreach (var recipient in recipientIds)
                {
                    await _notification.UpsertChatCounterAsync(
                        userId: recipient,
                        sessionId: sessionId,
                        sessionTitle: sessionTitle,
                        lastMessagePreview: preview,
                        ct: CancellationToken.None
                    );
                }

            }
            catch (Exception ex)
            {
                _logger.LogError(ex,"Failed to create chat notification for sessionId={SessionId}, messageId={MessageId}, authorId={UserId}",sessionId, message.Id, userId);
            }

            return (messageDto, null);
        }
        
        public async Task<(IEnumerable<SessionMessageResponse> Messages, ErrorResponseDto? Error)>GetMessagesAsync(int sessionId, int userId, int? limit, int? beforeMessageId)
        {
            var session = await _db.Sessions
             .AsNoTracking()
             .Include(s => s.Participants)
             .FirstOrDefaultAsync(s => s.Id == sessionId);

            if (session is null)
                return (Enumerable.Empty<SessionMessageResponse>(), Errors.Chat.NotFound());

            var isParticipant = session.OwnerId == userId ||
                session.Participants.Any(p => p.UserId == userId && p.Status == SessionParticipantStatus.Confirmed);

            if (!isParticipant)
                return (Enumerable.Empty<SessionMessageResponse>(), Errors.Chat.InvalidParticipant());

            var take = limit ?? 50;
                if (take < 1 || take > 200)
                    return (Enumerable.Empty<SessionMessageResponse>(), Errors.Chat.InvalidLimit());
            
            IQueryable<SessionMessage> query = _db.SessionMessages
                .AsNoTracking()
                .Where(m => m.SessionId == sessionId);

            if (beforeMessageId is int beforeId)
                query = query.Where(m => m.Id < beforeId);
           
            var messages = await query
                .OrderByDescending(m => m.Id)
                .Take(take)
                .Select(m => new SessionMessageResponse(
                    m.Id,
                    m.UserId,
                    m.Text,
                    m.User!.UserName!,
                    m.CreatedAt
                ))
                .ToListAsync();

            messages.Reverse();

            return (messages, null);
        } 
    }   
}
