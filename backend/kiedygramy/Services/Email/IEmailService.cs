using kiedygramy.DTO.Common;

namespace kiedygramy.Services.Email
{
    public interface IEmailService
    {
        Task<ErrorResponseDto?> SendConfirmationEmailAsync(string email, string token);
    }
}
