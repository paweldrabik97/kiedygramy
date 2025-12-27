using kiedygramy.DTO.Auth;
using kiedygramy.DTO.Common;
using kiedygramy.Domain;

namespace kiedygramy.Services.Auth
{
    public interface IAuthService
    {
        Task<(MeDto? User, ErrorResponseDto? Error)> RegisterAsync(RegisterDto dto);
        Task<ErrorResponseDto?> LoginAsync(LoginDto dto);
    }
}
