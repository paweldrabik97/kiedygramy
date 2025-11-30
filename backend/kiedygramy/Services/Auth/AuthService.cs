using kiedygramy.Domain;
using kiedygramy.DTO.Common;
using kiedygramy.DTO.Auth;
using Microsoft.AspNetCore.Identity;
using kiedygramy.Services.Auth;


namespace kiedygramy.Services.Auth
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;

        public AuthService(UserManager<User> userManager, SignInManager<User> signInManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
        }


        public async Task<(MeDto? User, ErrorResponseDto? Error)> RegisterAsync(RegisterDto dto)
        {
            
            if (await _userManager.FindByNameAsync(dto.Username) is not null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { "Username", new[] { "Nazwa użytkownika jest już zajęta." } }
                };

                return (null, new ErrorResponseDto(
                    status: 401,
                    title: "Validation Failed",
                    detail: $"Użytkownik o nazwie {dto.Username} już istnieje.",
                    instance: null,
                    errors: errors
                ));
            }

            
            if (!string.IsNullOrWhiteSpace(dto.Email) &&
                await _userManager.FindByEmailAsync(dto.Email) is not null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { "Email", new[] { "Ten adres e-mail jest już zajęty." } }
                };

                return (null, new ErrorResponseDto(
                    status: 401,
                    title: "Validation Failed",
                    detail: $"Adres e-mail {dto.Email} jest już zajęty.",
                    instance: null,
                    errors: errors
                ));
            }

            
            var user = new User
            {
                UserName = dto.Username,
                Email = dto.Email,
                FullName = dto.FullName,
                City = dto.City
            };

            var result = await _userManager.CreateAsync(user, dto.Password);

            if (!result.Succeeded)
            {
                var errorsDict = result.Errors
                    .GroupBy(e => MapIdentityCodeToField(e.Code))
                    .ToDictionary(
                        g => g.Key,
                        g => g.Select(e => e.Description).ToArray()
                    );

                var errorResponse = new ErrorResponseDto(
                    status: 401,
                    title: "Validation Failed",
                    detail: "Rejestracja nie powiodła się.",
                    instance: null,
                    errors: errorsDict
                );

                return (null, errorResponse);
            }

            var meDto = new MeDto(
                Id: user.Id,
                Username: user.UserName!,
                Email: user.Email,
                FullName: user.FullName,
                City: user.City
            );

            return (meDto, null);
        }

        public async Task<ErrorResponseDto?> LoginAsync(LoginDto dto)
        {
            var user = await _userManager.FindByNameAsync(dto.UsernameOrEmail)
                       ?? await _userManager.FindByEmailAsync(dto.UsernameOrEmail);

            if (user is null)
            {
                return new ErrorResponseDto(
                    status: 401,
                    title: "Validation Failed",
                    detail: "Podano nieprawidłowy login lub hasło.",
                    instance: null,
                    errors: null
                );
            }

            var result = await _signInManager.PasswordSignInAsync(
                user,
                dto.Password,
                isPersistent: true,
                lockoutOnFailure: true);

            if (!result.Succeeded)
            {
                return new ErrorResponseDto(
                    status: 401,
                    title: "Validation Failed",
                    detail: "Podano nieprawidłowy login lub hasło.",
                    instance: null,
                    errors: null
                );
            }

            return null; 
        }

        private static string MapIdentityCodeToField(string code)
        {
            if (code.StartsWith("Password", StringComparison.OrdinalIgnoreCase))
                return "Password";
            if (code.StartsWith("Email", StringComparison.OrdinalIgnoreCase))
                return "Email";
            if (code.StartsWith("UserName", StringComparison.OrdinalIgnoreCase) ||
                code.StartsWith("User", StringComparison.OrdinalIgnoreCase))
                return "Username";

            return "General";
        }
    }
}
