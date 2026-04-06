using kiedygramy.DTO.Session.Details;

namespace kiedygramy.DTO.Guest
{
    public record JoinAsGuestResponse(string GuestCode, string Token, SessionDetailsResponse Dto);
    
}
