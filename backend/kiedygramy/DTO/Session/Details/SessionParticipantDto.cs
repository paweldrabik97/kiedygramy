using kiedygramy.Domain.Enums;

namespace kiedygramy.DTO.Session.Details
{
    public record SessionParticipantDto
    (
        int UserId,
        string UserName,
        SessionParticipantRole Role,
        SessionParticipantStatus Status

    );
}
