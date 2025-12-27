using kiedygramy.DTO.Common;
using kiedygramy.DTO.Session;


namespace kiedygramy.Services.Chat
{
    public interface ISessionChatService
    {
        Task<(SessionMessageDto? Message, ErrorResponseDto? Error)> AddMessageAsync(int sessionId, int userId, CreateSessionMessageDto dto, CancellationToken ct);
        Task<(IEnumerable<SessionMessageDto> Messages, ErrorResponseDto Error)> GetMessagesAsync(int sessionId, int userId, int? limit, int? beforeMessageId);
    }
}
