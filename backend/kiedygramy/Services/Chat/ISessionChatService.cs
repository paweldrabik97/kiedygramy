using kiedygramy.DTO.Common;
using kiedygramy.DTO.Session.Chat;


namespace kiedygramy.Services.Chat
{
    public interface ISessionChatService
    {
        Task<(SessionMessageResponse? Message, ErrorResponseDto? Error)> AddMessageAsync(int sessionId, int userId, CreateSessionMessageRequest dto, CancellationToken ct);
        Task<(IEnumerable<SessionMessageResponse> Messages, ErrorResponseDto Error)> GetMessagesAsync(int sessionId, int userId, int? limit, int? beforeMessageId);
    }
}
