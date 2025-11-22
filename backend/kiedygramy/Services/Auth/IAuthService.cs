using kiedygramy.DTO.Auth;
using kiedygramy.DTO.Common;

namespace kiedygramy.Services.Auth
{
    public interface IAuthService
    {
        Task<(MeDto? User, ErrorResponseDto? Error)> RegisterAsync(RegisterDto dto);
        Task<ErrorResponseDto?> LoginAsync(LoginDto dto);
    }
}
