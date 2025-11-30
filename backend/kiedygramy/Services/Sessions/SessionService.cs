using kiedygramy.Data;
using kiedygramy.Domain;
using kiedygramy.DTO.Common;
using kiedygramy.DTO.Session;
using kiedygramy.Services.Sessions;
using Microsoft.EntityFrameworkCore;

namespace kiedygramy.Services.Sessions
{
    public class SessionService : ISessionService
    {
        private readonly AppDbContext _db;

        public SessionService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<(SessionDetailsDto? Session, ErrorResponseDto? Error)> CreateAsync(CreateSessionDto dto, int userId)
        {   
            var title = dto.Title?.Trim() ?? string.Empty;

            var validationError = ValidateSessionTitle(title);
            if (validationError is not null)         
                return (null, validationError);
                      
            if (dto.GameId is not null)
            {
                var gameExists = await _db.Games.AnyAsync(g => g.Id == dto.GameId && g.OwnerId == userId);

                if (!gameExists)
                {
                    var errors = new Dictionary<string, string[]>
                    {
                        { "GameId", new[] { "Podana gra nie istnieje." } }
                    };

                    return (null, new ErrorResponseDto(
                        status: 400,
                        title: "Validation Failed",
                        detail: "Podana gra nie istnieje.",
                        instance: null,
                        errors: errors
                    ));
                }
            }


            var session = new Session
            {
                Title = title,
                Date = dto.Date,
                Location = dto.Location?.Trim(),
                Description = dto.Description?.Trim(),
                OwnerId = userId,
                GameId = dto.GameId
            };


            var ownerParticipant = new SessionParticipant
            {
                Session = session,
                UserId = userId,
                Role = SessionParticipantRole.Host,
                Status = SessionParticipantStatus.Confirmed
            };

            _db.Sessions.Add(session);
            _db.SessionParticipants.Add(ownerParticipant);

            await _db.SaveChangesAsync();


            var owner = await _db.Users.FindAsync(userId);

            // Mapowanie do SessionDetailsDto
            var details = new SessionDetailsDto(
                Id: session.Id,
                Title: session.Title,
                Date: session.Date,
                Location: session.Location,
                Description: session.Description,
                OwnerId: session.OwnerId,
                OwnerUserName: owner!.UserName!,
                GameId: session.GameId,
                GameTitle: null
            );

            return (details, null);
        }


        public async Task<SessionDetailsDto?> GetByIdAsync(int id, int userId)
        {
            var session = await _db.Sessions
                .AsNoTracking()
                .Include(s => s.Owner)
                .Include(s => s.Game)
                .FirstOrDefaultAsync(s => s.Id == id && s.OwnerId == userId);

            if (session is null)
                return null;

            return new SessionDetailsDto(
                session.Id,
                session.Title,
                session.Date,
                session.Location,
                session.Description,
                session.OwnerId,
                session.Owner.UserName!,
                session.GameId,
                session.Game?.Title
            );
        }

        public async Task<IEnumerable<SessionListItemDto>> GetMineAsync(int userId)
        {
            return await _db.Sessions
                .AsNoTracking()
                .Where(s => s.OwnerId == userId)
                .OrderByDescending(s => s.Date ?? DateTime.MaxValue)
                .Select(s => new SessionListItemDto(
                    s.Id,
                    s.Title,
                    s.Date,
                    s.Location,
                    s.Participants.Count(p => p.Status == SessionParticipantStatus.Confirmed)
                ))
                .ToListAsync();
        }
        public async Task<ErrorResponseDto?> InviteAsync(int sessionId, int invitedUserId, int currentUser)
        { 
            var session = await _db.Sessions
                .AsNoTracking()
                .Include(s => s.Participants)
                .FirstOrDefaultAsync(s => s.Id == sessionId && s.OwnerId == currentUser);

            if (session is null)
                return SessionNotFoundError();

            var alreadyParticipant = session.Participants.Any(p => p.UserId == invitedUserId);

            if (alreadyParticipant)
                return AlreadyParticipantError();
            
            var participant = new SessionParticipant
            {
                SessionId = sessionId,
                UserId = invitedUserId,
                Role = SessionParticipantRole.Player,
                Status = SessionParticipantStatus.Invited
            };

            _db.SessionParticipants.Add(participant);
            await _db.SaveChangesAsync();

            return null;
        }
        
        public async Task<ErrorResponseDto?> RespondToInviteAsync(int sessionId, int userId, bool accept)
        { 
            var participant = await _db.SessionParticipants
                .FirstOrDefaultAsync(p => p.SessionId == sessionId && p.UserId == userId);

            if (participant is null)
                return InvitationNotFoundError();

            if (participant.Status != SessionParticipantStatus.Invited)
                return InvalidInvitationStatusError();

            participant.Status = accept
                ? SessionParticipantStatus.Confirmed
                : SessionParticipantStatus.Declined;

            await _db.SaveChangesAsync();

            return null;
        }

        public async Task<IEnumerable<SessionListItemDto>> GetInvitedAsync(int userId)
        { 
            return await _db.Sessions
                .AsNoTracking()
                .Where(s => s.Participants.Any
                (p => p.UserId == userId && p.Status == SessionParticipantStatus.Invited))
                .OrderByDescending(s => s.Date ?? DateTime.MaxValue)
                .Select(s => new SessionListItemDto(
                    s.Id,
                    s.Title,
                    s.Date,
                    s.Location,
                    s.Participants.Count(p => p.Status == SessionParticipantStatus.Confirmed)
                ))
                .ToListAsync();
        }

        public async Task<(IEnumerable<SessionParticipantDto> Participants, ErrorResponseDto? Error)> GetParticipantsAsync(int sessionId, int userId)
        {
            var sessionExists = await _db.Sessions
                .AsNoTracking()
                .AnyAsync(s => s.Id == sessionId && s.OwnerId == userId);

            if (!sessionExists)
                return (Enumerable.Empty<SessionParticipantDto>(), SessionNotFoundError());
             

            var participants =  await _db.SessionParticipants
                .AsNoTracking()
                .Where(p => p.SessionId == sessionId)
                .Include(p => p.User)
                .Select(p => new SessionParticipantDto(
                     p.UserId,
                     p.User.UserName!,
                     p.Role,
                     p.Status
                ))
                .ToListAsync(); 
            
            return (participants, null);
        }

        private ErrorResponseDto? ValidateSessionTitle (string title)
        {   
           

            if (string.IsNullOrWhiteSpace(title))
            {
                var errors = new Dictionary<string, string[]>
                {
                    { "Title", new[] { "Tytuł jest wymagany." } }
                };

                return  new ErrorResponseDto(
                    status: 400,
                    title: "Validation Failed",
                    detail: "Tytuł jest wymagany.",
                    instance: null,
                    errors: errors
                );
            }

            return null;
        }

        private ErrorResponseDto SessionNotFoundError()
        {
            return new ErrorResponseDto(
                status: 404,
                title: "Not Found",
                detail: "Sesja nie została znaleziona.",
                instance: null,
                errors: null
            );
        }

        private ErrorResponseDto AlreadyParticipantError()
        {
            var errors = new Dictionary<string, string[]>
            {
                { "Participant", new[] { "Użytkownik jest już uczestnikiem sesji." } }
            };
            return new ErrorResponseDto(
                status: 400,
                title: "Validation Failed",
                detail: "Użytkownik jest już uczestnikiem sesji.",
                instance: null,
                errors: errors
            );
        }

        private ErrorResponseDto InvitationNotFoundError()
        {
            return new ErrorResponseDto(
                status: 404,
                title: "Not Found",
                detail: "Zaproszenie nie zostało znalezione.",
                instance: null,
                errors: null
            );
        }

        private ErrorResponseDto InvalidInvitationStatusError()
        { 
            var errors = new Dictionary<string, string[]>
            {
                { "Status", new[] { "Nieprawidłowy status zaproszenia." } }
            };

            return new ErrorResponseDto(
                status: 400,
                title: "Validation Failed",
                detail: "Nieprawidłowy status zaproszenia.",
                instance: null,
                errors: errors
            );
        }
    }

    
}
