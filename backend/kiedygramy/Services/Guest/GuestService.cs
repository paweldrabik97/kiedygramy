using kiedygramy.Application.Errors;
using kiedygramy.Data;
using kiedygramy.Domain;
using kiedygramy.DTO.Common;
using kiedygramy.DTO.Session.Details;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using kiedygramy.Domain.Enums;
using kiedygramy.Services.Sessions;
using kiedygramy.DTO.Guest;

namespace kiedygramy.Services.Guest
{
    public class GuestService : IGuestService
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly AppDbContext _db;
        private readonly ISessionService _sessionService;
        private readonly ILogger<GuestService> _logger;
        public GuestService(UserManager<User> userManager, SignInManager<User> signInManager, AppDbContext db, ISessionService sessionService, ILogger<GuestService> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _db = db;
            _sessionService = sessionService;
            _logger = logger;
        }

        public async Task<(ErrorResponseDto? Error, InviteLinkResponse? Link)> GenerateInviteLinkAsync(int sessionId, int userId)
        {
            var session = await _db.Sessions.FirstOrDefaultAsync(s => s.Id == sessionId);

            if (session == null)
                return (Errors.Session.NotFound(), null);

            if(session.OwnerId != userId)
                return (Errors.General.Forbidden("użytkownik nie jest właścicielem tej sesji"), null);

            var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
                .Replace("+", "-")
                .Replace("/", "_")
                .Replace("=", "");

            var link = new SessionInviteLink {
                
                SessionId = sessionId,
                Token = token,
                ExpiresAt = DateTime.UtcNow.AddDays(30),        
            };

            _db.SessionInviteLinks.Add(link);
            await _db.SaveChangesAsync();

            return (null, new InviteLinkResponse(link.Token, link.ExpiresAt));
        }

        public async Task<(ErrorResponseDto? Error, JoinAsGuestResponse? dto)> JoinAsGuestAsync(string token, string guestName)
        {
            

                var link = await _db.SessionInviteLinks
                    .Include(s => s.Session)
                    .FirstOrDefaultAsync(s => s.Token == token);

                if (link is null)
                    return (Errors.Guest.LinkNotExists(), null);

                if (link.ExpiresAt < DateTime.UtcNow)
                    return (Errors.Guest.LinkExpired(), null);

                if (!link.Session.IsOpen)
                    return (Errors.Session.SessionIsClosed(), null);

                var user = new User
                {

                    UserName = guestName,
                    Email = $"guest_{Guid.NewGuid()}@guest.local",
                    IsGuest = true,
                    GuestCode = GenerateGuestCode(),
                    GuestToken = GenerateGuestToken(),
                    EmailConfirmed = true
                };

                var result = await _userManager.CreateAsync(user);

                if (!result.Succeeded)
                    return (Errors.General.Internal(), null);

                var participant = new SessionParticipant
                {
                    SessionId = link.Session.Id,
                    UserId = user.Id,
                    Role = SessionParticipantRole.Player,
                    Status = SessionParticipantStatus.Confirmed
                };

                await _db.SessionParticipants.AddAsync(participant);
                await _db.SaveChangesAsync();
                await _signInManager.SignInAsync(user, isPersistent: true);


                return (null, new JoinAsGuestResponse(user.GuestCode!,user.GuestToken!, await _sessionService.GetByIdAsync(link.SessionId, user.Id)));
            
            

        }

        public async Task<ErrorResponseDto?> RejoinAsGuestAsync(string guestCode)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.GuestCode == guestCode);

            if (user is null)
                return Errors.General.NotFound("użytkownik z takim kodem nie istnieje");

            await _signInManager.SignInAsync(user, isPersistent: true);

            return null;
        }

        public Task<ErrorResponseDto?> RemoveExpiredGuestsAsync(int sessionId)
        {
            throw new NotImplementedException();
        }

        public async Task<ErrorResponseDto?> JoinAsRegisteredUserAsync(string token, int userId)
        {
            var link = await _db.SessionInviteLinks
                .Include(s => s.Session)
                .FirstOrDefaultAsync(s => s.Token == token);

            if (link is null)
                return Errors.Guest.LinkNotExists();

            if (!link.Session.IsOpen)
                return Errors.Session.SessionIsClosed();

           var alreadyParticipant = await _db.SessionParticipants
                .FirstOrDefaultAsync(s => s.Session.Id == link.SessionId && s.UserId == userId);

            if (alreadyParticipant is not null)
                return Errors.Session.AlreadyParticipant();

            var participant = new SessionParticipant
            {
                SessionId = link.Session.Id,
                UserId = userId,
                Role = SessionParticipantRole.Player,
                Status = SessionParticipantStatus.Confirmed
            };
            
            await _db.SessionParticipants.AddAsync(participant);
            await _db.SaveChangesAsync();

            return null;
        }
        
        public static string GenerateGuestCode()
        {
            string[] animalsNames = ["Wolf", "Cat", "Dog", "Rabbit", "Turtle"];

            var animal = animalsNames[Random.Shared.Next(animalsNames.Length)];
            var Digit = Random.Shared.Next(1000, 9999);

            return $"{animal}-{Digit}";

        }

        public static string GenerateGuestToken()
        {
            return  Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
                .Replace("+", "-")
                .Replace("/", "_")
                .Replace("=", "");
        }
    }
}
