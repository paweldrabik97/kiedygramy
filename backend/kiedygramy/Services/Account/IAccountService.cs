using kiedygramy.DTO.Auth;
using kiedygramy.DTO.Common;

namespace kiedygramy.Services.Account
{
    public interface IAccountService
    {
        Task<ErrorResponseDto?> ChangeUserNameAsync(int userId, ChangeUserNameRequest dto);
        Task<ErrorResponseDto?> ChangePasswordAsync(int userId, ChangePasswordRequest dto);
        Task<ErrorResponseDto?> ChangeFullNameAsync(int userId, ChangeFullNameRequest dto);
        Task<ErrorResponseDto?> ChangeCityAsync(int userId, ChangeCityRequest dto);

    }
}
