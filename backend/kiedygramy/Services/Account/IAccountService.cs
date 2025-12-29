using kiedygramy.DTO.Auth;
using kiedygramy.DTO.Common;

namespace kiedygramy.Services.Account
{
    public interface IAccountService
    {
        Task<ErrorResponseDto?> ChangeUserNameAsync(int userId, ChangeUserNameDto dto);
        Task<ErrorResponseDto?> ChangePasswordAsync(int userId, ChangePasswordDto dto);
        Task<ErrorResponseDto?> ChangeFullNameAsync(int userId, ChangeFullNameDto dto);
        Task<ErrorResponseDto?> ChangeCityAsync(int userId, ChangeCityDto dto);

    }
}
