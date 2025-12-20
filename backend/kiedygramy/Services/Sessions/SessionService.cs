using kiedygramy.Application.Errors;
using kiedygramy.Data;
using kiedygramy.Domain;
using kiedygramy.Domain.Enums;
using kiedygramy.DTO.Common;
using kiedygramy.DTO.Session;
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

            if (dto.GameId is not null)
            {
                var gameExists = await _db.Games.AnyAsync(g => g.Id == dto.GameId && g.OwnerId == userId);

                if (!gameExists)
                    return (null, Errors.Session.GameNotFound());
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
                return Errors.Session.NotFound();

            var alreadyParticipant = session.Participants.Any(p => p.UserId == invitedUserId);

            if (alreadyParticipant)
                return Errors.Session.AlreadyParticipant();

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
                return Errors.Session.InvitationNotFound();

            if (participant.Status != SessionParticipantStatus.Invited)
                return Errors.Session.InvalidInvitationStatus();

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
            var session = await _db.Sessions
                .AsNoTracking()
                .AnyAsync(s => s.Id == sessionId && s.OwnerId == userId);

            if (!session)
                return (Enumerable.Empty<SessionParticipantDto>(), Errors.Session.NotFound());

            var participants = await _db.SessionParticipants
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

        public async Task<ErrorResponseDto?> SetAvailabilityWindowAsync(int sessionId, int userId, SetAvailabilityWindowDto dto)
        {
            var session = await _db.Sessions.FirstOrDefaultAsync(s => s.Id == sessionId && s.OwnerId == userId);

            if (session is null)
                return Errors.Session.NotFound();

            var fromDate = dto.From.Date;
            var toDate = dto.To.Date;

            if (fromDate > toDate)
                return Errors.Session.InvalidAvailabilityRange();

            if (dto.Deadline <= DateTime.UtcNow)
                return Errors.Session.InvalidAvailabilityDeadline();

            session.AvailabilityFrom = fromDate;
            session.AvailabilityTo = toDate;
            session.AvailabilityDeadline = dto.Deadline;

            var existingAvailabilites = _db.SessionAvailabilities
                .Where(a => a.SessionId == sessionId);

            _db.SessionAvailabilities.RemoveRange(existingAvailabilites);

            await _db.SaveChangesAsync();
            return null;
        }

        public async Task<ErrorResponseDto?> UpdateAvailabilityAsync(int sessionId, int userId, UpdateAvailabilityDto dto)
        {
            var session = await _db.Sessions               
                .FirstOrDefaultAsync(s => s.Id == sessionId);

            if (session is null)
                return Errors.Session.NotFound();

            var isOwner = session.OwnerId == userId;

            var isConfirmedParticipant = await _db.SessionParticipants
                .AnyAsync(p =>
                p.SessionId == sessionId &&
                p.UserId == userId &&
                p.Status == SessionParticipantStatus.Confirmed);

            if (!isOwner && !isConfirmedParticipant)
                return Errors.Session.InvalidParticipant();

            if (session.AvailabilityFrom is null ||
                session.AvailabilityTo is null ||
                session.AvailabilityDeadline is null)
                return Errors.Session.AvailabilityNotConfigured();

            if (session.AvailabilityDeadline <= DateTime.UtcNow)
                return Errors.Session.InvalidAvailabilityDeadline();

            var fromDate = session.AvailabilityFrom.Value.Date;
            var toDate = session.AvailabilityTo.Value.Date;

            var normalizedDates = dto.Dates
                .Select(d => d.Date)
                .Where(d => d >= fromDate && d <= toDate)
                .Distinct()
                .OrderBy(d => d)
                .ToList();

            var existing = await _db.SessionAvailabilities
                .Where(a => a.SessionId == sessionId && a.UserId == userId)
                .ToListAsync();

            _db.SessionAvailabilities.RemoveRange(existing);

            if (normalizedDates.Count > 0)
            {
                var newAvailabilities = normalizedDates
                    .Select(date => new SessionAvailability
                    {
                        SessionId = sessionId,
                        UserId = userId,
                        Date = date
                    });

                await _db.SessionAvailabilities.AddRangeAsync(newAvailabilities);
            }

            await _db.SaveChangesAsync();
            return null;
        }

        public async Task<(MyAvailabilityDto? Availability, ErrorResponseDto? Error)> GetMyAvailabilityAsync(int sessionId, int userId)
        {
            var session = await _db.Sessions
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == sessionId);

            if (session is null)
                return (null, Errors.Session.NotFound());

            var isOwner = session.OwnerId == userId;
            var isConfirmedParticipant = await _db.SessionParticipants
                .AsNoTracking()
                .AnyAsync(p =>
                p.SessionId == sessionId &&
                p.UserId == userId &&
                p.Status == SessionParticipantStatus.Confirmed);

            if (!isOwner && !isConfirmedParticipant)
                return (null, Errors.Session.InvalidParticipant());

            var dates = await _db.SessionAvailabilities
                .AsNoTracking()
                .Where(a => a.SessionId == sessionId && a.UserId == userId)
                .Select(a => a.Date)
                .OrderBy(d => d.Date)
                .ToListAsync();

            var dto = new MyAvailabilityDto(dates);
            return (dto, null);
        }

        public async Task<(AvailabilitySummaryDto? Summary, ErrorResponseDto? Error)> GetAvailabilitySummaryAsync(int sessionId, int userId)
        {
            var session = await _db.Sessions
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == sessionId);

            if (session is null)
                return (null, Errors.Session.NotFound());

            if (session.OwnerId != userId)
                return (null, Errors.Session.NotOwner());

            var dayList = await _db.SessionAvailabilities
                .AsNoTracking()
                .Where(a => a.SessionId == sessionId)
                .GroupBy(a => a.Date)
                .Select(g => new AvailabilitySummaryDayDto(
                    g.Key,
                    g.Count()))
                .OrderBy(d => d.Date)
                .ToListAsync();

            var dto = new AvailabilitySummaryDto(dayList);
            return (dto, null);
        }

        public async Task<ErrorResponseDto?> SetFinalDateAsync(int sessionId, int userId, SetFinalDateDto dto)
        {
            
            var session = await _db.Sessions
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == sessionId);

            if (session is null)
                return Errors.Session.NotFound();

            if (session.OwnerId != userId)
                return Errors.Session.NotOwner();

            if(session.AvailabilityFrom is null ||
                session.AvailabilityTo is null ||
                session.AvailabilityDeadline is null)
                return Errors.Session.AvailabilityNotConfigured();

            if(DateTime.UtcNow < session.AvailabilityDeadline.Value)
                return Errors.Session.AvailabilityStillOpen();

            var finalDate = dto.DateTime;

            if (finalDate <= DateTime.UtcNow)
                return Errors.Session.FinalDateInPast();

            if (session.AvailabilityFrom is not null && session.AvailabilityTo is not null)
            { 
                var from = session.AvailabilityFrom.Value.Date;
                var to = session.AvailabilityTo.Value.Date;
                var day = finalDate.Date;

                if(day < from || day > to)
                    return Errors.Session.FinalDateOutsideAvailability();
            }

            session.Date = finalDate;
            await _db.SaveChangesAsync();

            return null;
        }

        public async Task<ErrorResponseDto?> UpdateAttendanceAsync(int sessionId, int userId, UpdateAttendanceDto dto)
        {
            var session = await _db.Sessions
                .FirstOrDefaultAsync(s => s.Id == sessionId);

            if (session is null)
                return Errors.Session.NotFound();

            if (session.Date is null)
                return Errors.Session.FinalDateNotSet();

            if(session.Date.Value <=  DateTime.UtcNow)
                return Errors.Session.SessionAlreadyHappend();

            var isOwner = session.OwnerId == userId;

            var isConfirmedParticipant = await _db.SessionParticipants
                .AnyAsync(p =>
                p.SessionId == sessionId &&
                p.UserId == userId &&
                p.Status == SessionParticipantStatus.Confirmed);
            
            if(!isOwner && !isConfirmedParticipant)
                return Errors.Session.InvalidParticipant();

            if(dto.Status == AttendanceStatus.None)
               return Errors.Session.InvalidAttendanceStatus();

            var participant = await _db.SessionParticipants
                .FirstOrDefaultAsync(p => p.SessionId == sessionId && p.UserId == userId);

            if(participant is null)
                return Errors.Session.InvalidParticipant();

            participant.AttendanceStatus = isOwner
                ? AttendanceStatus.Yes
                : dto.Status;

            await _db.SaveChangesAsync();
            return null;

           
        }


    }
  
}
