using kiedygramy.Domain;
using kiedygramy.DTO.Common;
using kiedygramy.DTO.Guest;
using kiedygramy.DTO.Session.Details;

namespace kiedygramy.Services.Guest
{
    public interface IGuestService
    {
        Task<(ErrorResponseDto? Error, InviteLinkResponse? Link)> GenerateInviteLinkAsync(int sessionId, int userId);
        Task<(ErrorResponseDto? Error, JoinAsGuestResponse? dto)> JoinAsGuestAsync(string token, string guestName);
        Task<ErrorResponseDto?> RejoinAsGuestAsync(string guestCode);
        Task<ErrorResponseDto?> RemoveExpiredGuestsAsync(int sessionId);
        Task<ErrorResponseDto?> JoinAsRegisteredUserAsync(string token, int userId);
    }   
}
