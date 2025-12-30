using kiedygramy.DTO.Auth;
using kiedygramy.DTO.Common;
using kiedygramy.Domain;

namespace kiedygramy.Services.Auth
{
    public interface IAuthService
    {
        Task<(MeResponse? User, ErrorResponseDto? Error)> RegisterAsync(RegisterRequest dto);
        Task<ErrorResponseDto?> LoginAsync(LoginRequest dto);
        
    }
}
