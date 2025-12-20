using kiedygramy.Domain;
using kiedygramy.DTO.Common;
using kiedygramy.DTO.Auth;
using Microsoft.AspNetCore.Identity;
using kiedygramy.Application.Errors;    


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
                return (null, Errors.Auth.UsernameTaken());

            
            if (!string.IsNullOrWhiteSpace(dto.Email) &&
                await _userManager.FindByEmailAsync(dto.Email) is not null)
                    return (null, Errors.Auth.EmailTaken());

            var user = new User
            {
                UserName = dto.Username,
                Email = dto.Email,
                FullName = dto.FullName,
                City = dto.City
            };

            var result = await _userManager.CreateAsync(user, dto.Password);

            if (!result.Succeeded)
                return (null, Errors.Auth.IdentityValidation(result.Errors));

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
        // Przyda się do zmiany hasła itp.
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
