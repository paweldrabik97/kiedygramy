using kiedygramy.Data;
using kiedygramy.Domain;
using kiedygramy.DTO.Common;
using kiedygramy.DTO.Session;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using kiedygramy.Hubs;


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
                .Include(s => s.Participants)
                .FirstOrDefaultAsync(s => s.Id == sessionId);

            if (session is null)
                return (null, SessionNotFoundError());

            var isParticipant = session.OwnerId == userId ||
                session.Participants.Any(p => p.UserId == userId &&
                p.Status == SessionParticipantStatus.Confirmed);

            if (!isParticipant)
                return (null, NotParticipantError());

            var validationError = ValidateChatMessage(dto.Text);
            if(validationError is not null)
                return (null, validationError);

            var now = DateTime.UtcNow;

            var message = new SessionMessage
            {
                SessionId = sessionId,
                UserId = userId,
                Text = dto.Text,
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
                .Group($"Session_{sessionId}")
                .SendAsync("NewSessionMessage", messageDto);

            return (messageDto, null);
        }
        
        public async Task<(IEnumerable<SessionMessageDto> Messages, ErrorResponseDto? Error)>GetMessagesAsync(int sessionId, int userId, int? limit, int? beforeMessageId)
        { 
           var session = await _db.Sessions
                .Include(s => s.Participants)
                .FirstOrDefaultAsync(s => s.Id == sessionId);

            if (session is null)
                return (Enumerable.Empty<SessionMessageDto>(), SessionNotFoundError());

            var isParticipant = session.OwnerId == userId || 
                session.Participants.Any(p => p.UserId == userId && p.Status == SessionParticipantStatus.Confirmed);

            if (!isParticipant)
                return (Enumerable.Empty<SessionMessageDto>(), NotParticipantError());

            var query = _db.SessionMessages
                .AsNoTracking()
                .Where(m => m.SessionId == sessionId)
                .Include(m => m.User)
                .OrderByDescending(m => m.Id);

            if (beforeMessageId is int beforeId)
            {
                query = query
                    .Where(m => m.Id < beforeId)
                    .OrderByDescending(m => m.Id);
            }

            var take = limit .GetValueOrDefault(50);
            if (take <= 0) take = 50;
            if (take > 200) take = 200;

            var messages = await query
                .Take(take)
                .ToListAsync();

            messages.Reverse();

            var dtoList = messages.Select(m => new SessionMessageDto(
                m.Id,
                m.UserId,
                m.User!.UserName!,
                m.Text,
                m.CreatedAt
            ));

            return (dtoList, null);
        }

        private ErrorResponseDto ValidateChatMessage(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
            {
                var errors = new Dictionary<string, string[]>
                {
                    { "Text", new[] { "Message text cannot be empty." } }
                };
                return new ErrorResponseDto(

                    status: 400,
                    title: "Invalid Message",
                    detail: "The message text is invalid.",
                    errors: errors
                );
            }

            if (text.Length > 500)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { "Text", new[] { "Wiadomość nie może być dłuższa" } }
                };
                return new ErrorResponseDto(

                    status: 400,
                    title: "Invalid Message",
                    detail: "The message it to long",
                    errors: errors
                );
            }

            return null;
        }

        private ErrorResponseDto SessionNotFoundError()
        {
            return new ErrorResponseDto(
                status: 404,
                title: "Session Not Found",
                detail: "The specified session does not exist.",
                instance: null,
                errors: null
            );
        }

        private ErrorResponseDto NotParticipantError()
        {
            return new ErrorResponseDto(
                status: 403,
                title: "Forbidden",
                detail: "You are not a participant of this session.",
                instance: null,
                errors: null
                );
        }
    }

    
}
