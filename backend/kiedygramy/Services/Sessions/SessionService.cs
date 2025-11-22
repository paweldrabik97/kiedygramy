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
            var title = dto.Title.Trim();

            var ValidationError = validateSesion(title);
            if (ValidationError is not null)         
                return (null, ValidationError);
                      
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
                Role = "Host",
                Status = "Confirmed"
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
                .Where(s => s.OwnerId == userId)
                .OrderByDescending(s => s.Date ?? DateTime.MaxValue)
                .Select(s => new SessionListItemDto(
                    s.Id,
                    s.Title,
                    s.Date,
                    s.Location,
                    s.Participants.Count(p => p.Status == "Confirmed")
                ))
                .ToListAsync();
        }
        private ErrorResponseDto? validateSesion (string title)
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
    }

    
}
