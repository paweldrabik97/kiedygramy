using kiedygramy.DTO.Common;

namespace kiedygramy.Services.Chat
{
    public interface ISessionChatHubService
    {
        Task<ErrorResponseDto> ValidateJoinAsync(int sessionId, int userId, CancellationToken ct);
    }
}
