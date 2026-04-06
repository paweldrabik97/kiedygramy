using kiedygramy.DTO.Common;
using kiedygramy.Services.Email;

public class FakeEmailService : IEmailService
{
    public Task<ErrorResponseDto?> SendConfirmationEmailAsync(string email, string token)
        => Task.FromResult<ErrorResponseDto?>(null);
}
