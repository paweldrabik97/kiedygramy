using kiedygramy.Data;
using kiedygramy.Domain;
using kiedygramy.DTO.Common;
using kiedygramy.DTO.Session;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using kiedygramy.Hubs;
using System.Xml;
using kiedygramy.Application.Errors;
using kiedygramy.Domain.Enums;


namespace kiedygramy.Services.Chat
{
    public class SessionChatService : ISessionChatService
    {
        private readonly AppDbContext _db;
        private readonly IHubContext<SessionChatHub> _hubContext;

        public SessionChatService(AppDbContext db, IHubContext<SessionChatHub> hubContext)
        {
            _db = db;
            _hubContext = hubContext;
        }

        public async Task<(SessionMessageDto? Message, ErrorResponseDto? Error)> AddMessageAsync(int sessionId, int userId, CreateSessionMessageDto dto)
        {
            var session = await _db.Sessions
                .AsNoTracking()
                .Include(s => s.Participants)
                .FirstOrDefaultAsync(s => s.Id == sessionId);

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
            await _db.SaveChangesAsync();

            var user = await _db.Users
                .AsNoTracking()
                .FirstAsync(u => u.Id == userId);

            var messageDto = new SessionMessageDto(
                message.Id,
                message.UserId,
                user.UserName!,
                message.Text,
                message.CreatedAt

            );

            await _hubContext.Clients
                .Group($"session-{sessionId}")
                .SendAsync("NewSessionMessage", messageDto);

            return (messageDto, null);
        }
        
        public async Task<(IEnumerable<SessionMessageDto> Messages, ErrorResponseDto? Error)>GetMessagesAsync(int sessionId, int userId, int? limit, int? beforeMessageId)
        {
            var session = await _db.Sessions
             .AsNoTracking()
             .Include(s => s.Participants)
             .FirstOrDefaultAsync(s => s.Id == sessionId);

            if (session is null)
                return (Enumerable.Empty<SessionMessageDto>(), Errors.Chat.NotFound());

            var isParticipant = session.OwnerId == userId ||
                session.Participants.Any(p => p.UserId == userId && p.Status == SessionParticipantStatus.Confirmed);

            if (!isParticipant)
                return (Enumerable.Empty<SessionMessageDto>(), Errors.Chat.InvalidParticipant());

            var take = limit ?? 50;
                if (take < 1 || take > 200)
                    return (Enumerable.Empty<SessionMessageDto>(), Errors.Chat.InvalidLimit());
            
            IQueryable<SessionMessage> query = _db.SessionMessages
                .AsNoTracking()
                .Where(m => m.SessionId == sessionId);

            if (beforeMessageId is int beforeId)
                query = query.Where(m => m.Id < beforeId);
           
            var messages = await query
                .OrderByDescending(m => m.Id)
                .Take(take)
                .Select(m => new SessionMessageDto(
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
