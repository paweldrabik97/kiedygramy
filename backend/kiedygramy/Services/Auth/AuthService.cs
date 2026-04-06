using kiedygramy.Domain;
using kiedygramy.DTO.Common;
using kiedygramy.DTO.Auth;
using Microsoft.AspNetCore.Identity;
using kiedygramy.Application.Errors;    
using kiedygramy.Services.Notifications;
using kiedygramy.Domain.Enums;
using kiedygramy.Services.Email;


namespace kiedygramy.Services.Auth
{
    public class AuthService : IAuthService 
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly INotificationService _notificationService;
        private readonly ILogger<AuthService> _logger;
        private readonly IEmailService _emailService;

        public AuthService(UserManager<User> userManager, SignInManager<User> signInManager, INotificationService notification, ILogger<AuthService> logger, IEmailService emailService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _notificationService = notification;
            _logger = logger;
            _emailService = emailService;
        }


        public async Task<(MeResponse? User, ErrorResponseDto? Error)> RegisterAsync(RegisterRequest dto)
        {

            if (await _userManager.FindByNameAsync(dto.Username) is not null)
                return (null, Errors.Auth.UsernameTaken());

            
            if (!string.IsNullOrWhiteSpace(dto.Email) &&
                await _userManager.FindByEmailAsync(dto.Email) is not null)
                    return (null, Errors.Auth.EmailTaken());

            var user = new User
            {
                UserName = dto.Username,
                Email = dto.Email,
                FullName = dto.FullName,
                City = dto.City,
                PrefferedLanguage = dto.PrefferedLanguage ?? "en"
            };

            var result = await _userManager.CreateAsync(user, dto.Password);

            if (!result.Succeeded)
                return (null, Errors.Auth.IdentityValidation(result.Errors));
                    
            var confirmationToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var emailError = await _emailService.SendConfirmationEmailAsync(user.Email!, confirmationToken);
               
            if(emailError is not null)
                _logger.LogError($"failed to send confirmation email for UserId: {user.Id}");
            

            try
            {


                await _notificationService.CreateAsync(
                   userId: user.Id,
                    type: NotificationType.Welcome,
                    title: "Witamy na KiedyGramy!",
                    message: "Dziekujemy za Rejestracje... blblblbl",
                    url: "/welcome", // tutaj moze byc link do jakiegos welcome page
                    sessionId: null,
                    key: "welcome",
                    ct: CancellationToken.None
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"failed to create register notification for UserId: {user.Id}");
            }

            var meDto = new MeResponse(
                Id: user.Id,
                Username: user.UserName!,
                Email: user.Email,
                FullName: user.FullName,
                City: user.City,
                PrefferedLanguage: user.PrefferedLanguage
            );

            return (meDto, null);
        }

        public async Task<ErrorResponseDto?> LoginAsync(LoginRequest dto)
        {
            var user = await _userManager.FindByNameAsync(dto.UsernameOrEmail)
                       ?? await _userManager.FindByEmailAsync(dto.UsernameOrEmail);

            if (user is null)
                return Errors.Auth.InvalidCredentials();

            var result = await _signInManager.PasswordSignInAsync(
                user,
                dto.Password,
                isPersistent: true,
                lockoutOnFailure: true
            );

            if (!result.Succeeded)
                return Errors.Auth.InvalidCredentials();

            return null; 
        }

        public async Task<ErrorResponseDto?> ConfirmEmailAsync(string email, string token)
        {
            var user = await _userManager.FindByEmailAsync(email);

            if (user is null)
                return Errors.Auth.EmailNotFound();

            var alreadyConfirmed = await _userManager.IsEmailConfirmedAsync(user);

            if(alreadyConfirmed)
                return Errors.Auth.EmailAlreadyConfirmed();

            var encodedToken = Uri.UnescapeDataString(token);
            var result = await _userManager.ConfirmEmailAsync(user, encodedToken);

            if (!result.Succeeded)
                return Errors.Auth.UnableToConfirm(); 

            return null;
        }

        public async Task<ErrorResponseDto?> ResendConfiramtionEmailAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);

            if (user is null)
                return Errors.Auth.EmailNotFound();

            var alreadyConfirmed = await _userManager.IsEmailConfirmedAsync(user);

            if (alreadyConfirmed)
                return Errors.Auth.EmailAlreadyConfirmed();

            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var emailError = await _emailService.SendConfirmationEmailAsync(email, token);

            if (emailError is not null)
            {
                _logger.LogError($"failed to send confirmation email for UserId: {user.Id}");
                return Errors.Auth.UnableToConfirm();
            }

            return null;
        }
    }
}
