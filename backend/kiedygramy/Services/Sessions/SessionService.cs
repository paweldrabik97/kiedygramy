using kiedygramy.Application.Errors;
using kiedygramy.Data;
using kiedygramy.Domain;
using kiedygramy.Domain.Enums;
using kiedygramy.DTO.Common;
using kiedygramy.DTO.Session;
using Microsoft.EntityFrameworkCore;
using kiedygramy.Services.Notifications;

namespace kiedygramy.Services.Sessions
{
    public class SessionService : ISessionService
    {
        private readonly AppDbContext _db;
        private readonly INotificationService _notification;

        public SessionService(AppDbContext db, INotificationService notification)
        {
            _db = db;
            _notification = notification;
        }

        public async Task<(SessionDetailsDto? Session, ErrorResponseDto? Error)> CreateAsync(CreateSessionDto dto, int userId)
        {
            var title = dto.Title?.Trim() ?? string.Empty;          

            if (dto.GameIds is not null)
            {
                var gameExists = await _db.Games.AnyAsync(g => dto.GameIds.Contains(g.Id) && g.OwnerId == userId);

                if (!gameExists)
                    return (null, Errors.Session.GameNotFound());
            }

            var session = new Session 
            {
                Title = title,
                Date = dto.Date,
                Location = dto.Location?.Trim(),
                Description = dto.Description?.Trim(),
                OwnerId = userId
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
                Games: session.Games.Select(g => new SessionGameDto(
                    g.Id,
                    g.Title,
                    g.ImageUrl
                )).ToList(),
                AvailabilityFrom: session.AvailabilityFrom,
                AvailabilityTo: session.AvailabilityTo,
                AvailabilityDeadline: session.AvailabilityDeadline
            );

            return (details, null);
        }

        public async Task<SessionDetailsDto?> GetByIdAsync(int id, int userId)
        {
            var session = await _db.Sessions
                .AsNoTracking()
                .Include(s => s.Owner)
                .Include(s => s.Games)
                .FirstOrDefaultAsync(s => s.Id == id &&
                    (s.OwnerId == userId || s.Participants.Any(p => p.UserId == userId)));

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
                Games: session.Games.Select(g => new SessionGameDto(
                    g.Id,
                    g.Title,
                    g.ImageUrl
                )).ToList(),
                session.AvailabilityFrom,
                session.AvailabilityTo,
                session.AvailabilityDeadline
            );
        }

        public async Task<IEnumerable<SessionListItemDto>> GetMineAsync(int userId)
        {
            return await _db.Sessions
                .AsNoTracking()
                .Where(s => s.OwnerId == userId || s.Participants.Any(p => p.UserId == userId && p.Status == SessionParticipantStatus.Confirmed))
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

            try
            {
                var title = "Nowe zaproszenie do sesji";
                var message = $"Zaproszono Cię do sesji: {session.Title}";
                var url = $"/sessions/{sessionId}";

                await _notification.CreateAsync(
                    userId: invitedUserId,
                    type: NotificationType.SessionInviteRecived,
                    title: title,
                    message: message,
                    url: url,
                    sessionId: sessionId,
                    key: $"invite:{sessionId}",
                    ct: CancellationToken.None
                );
            }
            catch
            {
                // ignorujemy błędy publikacji powiadomień, kiedyś doda się loga
            }

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
                .AnyAsync(s => s.Id == sessionId && (s.OwnerId == userId || s.Participants.Any(p => p.UserId == userId)));

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

            var fromDate = DateTime.SpecifyKind(dto.From.Date, DateTimeKind.Utc);
            var toDate = DateTime.SpecifyKind(dto.To.Date, DateTimeKind.Utc);

            var deadline = dto.Deadline.Kind == DateTimeKind.Utc
                ? dto.Deadline
                : DateTime.SpecifyKind(dto.Deadline, DateTimeKind.Utc);

            if (fromDate > toDate)
                return Errors.Session.InvalidAvailabilityRange();

            if (dto.Deadline <= DateTime.UtcNow)
                return Errors.Session.InvalidAvailabilityDeadline();

            session.AvailabilityFrom = fromDate;
            session.AvailabilityTo = toDate;
            session.AvailabilityDeadline = deadline;

            var existingAvailabilites = _db.SessionAvailabilities
                .Where(a => a.SessionId == sessionId)
                .ExecuteDeleteAsync();

            await _db.SaveChangesAsync();
            return null;
        }

        public async Task<ErrorResponseDto?> UpdateAvailabilityAsync(int sessionId, int userId, UpdateAvailabilityDto dto)
        {
            var session = await _db.Sessions
                .AsNoTracking()
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

            await _db.SessionAvailabilities
                .Where(sa => sa.SessionId == sessionId && sa.UserId == userId)
                .ExecuteDeleteAsync();

            

            if (normalizedDates.Count > 0)
            {
                var newAvailabilities = normalizedDates
                    .Select(date => new SessionAvailability
                    {
                        SessionId = sessionId,
                        UserId = userId,
                        Date = DateTime.SpecifyKind(date.Date, DateTimeKind.Utc)
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
            // Walidacja sesji 
            var session = await _db.Sessions
                .AsNoTracking()
                .Include(s => s.Participants)
                .FirstOrDefaultAsync(s => s.Id == sessionId);

            if (session is null)
                return (null, Errors.Session.NotFound());

            var isOwner = session.OwnerId == userId;

            // Sprawdzamy czy user jest na liście uczestników z potwierdzonym statusem
            var isParticipant = session.Participants
                .Any(p => p.UserId == userId && p.Status == SessionParticipantStatus.Confirmed);

            // Jeśli nie jest ani właścicielem, ani uczestnikiem -> BŁĄD
            if (!isOwner && !isParticipant)
            {
                // Najlepiej zwrócić tu błąd typu Forbidden / AccessDenied.
                // Jeśli nie masz takiej metody w Errors, możesz użyć tymczasowo NotOwner
                // lub stworzyć Errors.Session.Forbidden()
                return (null, Errors.Session.NotOwner());
            }

            var hasAnyVotes = await _db.SessionAvailabilities
                .AnyAsync(a => a.SessionId == sessionId);

            if (!hasAnyVotes)
            {
                return (new AvailabilitySummaryDto(new List<AvailabilitySummaryDayDto>()), null);
            }

            var rawData = await _db.SessionAvailabilities
                .AsNoTracking()
                .Where(a => a.SessionId == sessionId)
                .GroupBy(a => a.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    Count = g.Count()
                })
                .OrderBy(x => x.Date)
                .ToListAsync();

            // Mapowanie na DTO w pamięci (C#)
            var dayList = rawData
                .Select(x => new AvailabilitySummaryDayDto(x.Date, x.Count))
                .ToList();

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

        public async Task<ErrorResponseDto?> SetFinalGamesAsync(int sessionId, int userId, SetFinalGamesDto dto)
        {
            var session = await _db.Sessions
                .Include(s => s.Games)
                .FirstOrDefaultAsync(s => s.Id == sessionId);

            if (session is null)
                return Errors.Session.NotFound();

            if (session.OwnerId != userId)
                return Errors.Session.NotOwner();

            var incomingIds = dto.GameIds ?? new List<int>();

            var selectedGames = await _db.Games
                .Where(g => dto.GameIds.Contains(g.Id))
                .ToListAsync();

            session.Games.Clear();

            foreach (var game in selectedGames)
            {
                session.Games.Add(game);
            }

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

        public async Task<ErrorResponseDto?> DeleteAsync(int sessionId, int userId)
        {
            var session = await _db.Sessions
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == sessionId && s.OwnerId == userId);


            if (session is null)
                return Errors.Session.NotFound();

            _db.Sessions.Remove(session);
            await _db.SaveChangesAsync();

            return null;
        }

        public async Task<(List<SessionPoolGameDto>? GamePool, ErrorResponseDto? Error)> GetConfirmedParticipantsGamesAsync(int sessionId, int userId)
        {
            var session = await _db.Sessions
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == sessionId);

            if (session is null)
                return (null, Errors.Session.NotFound());

            var hasAccess = session.OwnerId == userId ||
               await _db.SessionParticipants.AnyAsync(p => p.SessionId == sessionId &&
               p.UserId == userId && p.Status == SessionParticipantStatus.Confirmed);

            if(!hasAccess)
                return (null, Errors.Session.InvalidParticipant());

            var confirmedParticipantIds = await _db.SessionParticipants
                .AsNoTracking()
                .Where(p => p.SessionId == sessionId && p.Status == SessionParticipantStatus.Confirmed)
                .Select(p => p.UserId)
                .Distinct()
                .ToListAsync();

            if(!confirmedParticipantIds.Contains(session.OwnerId))
                confirmedParticipantIds.Add(session.OwnerId);

            var games = await _db.Games
                .AsNoTracking()
                .Where(g => confirmedParticipantIds.Contains(g.OwnerId))
                .Select(g => new
                {
                    g.Id,
                    g.Title,
                    OwnerName = g.Owner.UserName ?? "(brak nazwy)",
                    MinPlayers = g.MinPlayers,
                    MaxPlayers = g.MaxPlayers,
                    g.ImageUrl
                }).ToListAsync();

            var votes = await _db.SessionGameVotes
                .AsNoTracking()
                .Where(v => v.SessionId == sessionId)
                .Select(v => new {v.GameKey, v.UserId })
                .ToListAsync();

            var votesCounts = votes
                .GroupBy(g => g.GameKey)
                .ToDictionary(g => g.Key, g => g.Count());

            var myVotes = votes
                .Where(v => v.UserId == userId)
                .Select(v => v.GameKey).ToHashSet();

            var groupedGames = games
                .Where(g => !string.IsNullOrEmpty(g.Title))
                .GroupBy(g => g.Title.Trim().ToLowerInvariant())
                .Select(g =>
                {
                    var id = g.First().Id;
                    var key = g.Key;
                    var first = g.First();
                    var owners = g.Select(x => x.OwnerName).Distinct().OrderBy(x => x).ToList();
                    var image = g.Select(x => x.ImageUrl).FirstOrDefault(url => !string.IsNullOrEmpty(url));

                    return new SessionPoolGameDto
                    (
                        Id: id,
                        Title: first.Title.Trim(),
                        Key: key,
                        Count: g.Count(),
                        Owners: owners,
                        ImageUrl: image,
                        MinPlayers: first.MinPlayers,
                        MaxPlayers: first.MaxPlayers,
                        VotesCount: votesCounts.TryGetValue(key, out var c) ? c : 0,
                        hasVoted: myVotes.Contains(key)
                    );

                }).OrderBy(x => x.Title).ToList();

            return (groupedGames, null);
        }

        public async Task<ErrorResponseDto?> ToggleGameVoteAsync(int sessionId, int userId, string key)
        {
            if (string.IsNullOrWhiteSpace(key))
                return Errors.General.Validation("Nieprawidłowy klucz gry","Key");

            key = key.Trim().ToLowerInvariant();

            var session = await _db.Sessions
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == sessionId);

            if (session is null)
                return Errors.Session.NotFound();

            var hasAccess = session.OwnerId == userId ||
                await _db.SessionParticipants.AnyAsync(p =>
                p.SessionId == sessionId &&
                p.UserId == userId &&
                p.Status == SessionParticipantStatus.Confirmed);

            if(!hasAccess)
                return Errors.Session.InvalidParticipant();

            var existing = await _db.SessionGameVotes.
                FirstOrDefaultAsync(v => v.SessionId == sessionId &&
                v.UserId == userId &&
                v.GameKey == key);

            if(existing is not null)
                _db.SessionGameVotes.Remove(existing);
            else
                _db.SessionGameVotes.Add(new SessionGameVote
                {
                    SessionId = sessionId,
                    UserId = userId,
                    GameKey = key
                });

            await _db.SaveChangesAsync();
            return null;
        }
    }  
}
