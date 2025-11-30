using kiedygramy.Domain;

namespace kiedygramy.DTO.Session
{
    public record SessionParticipantDto
    (
        int UserId,
        string UserName,
        SessionParticipantRole Role,
        SessionParticipantStatus Status

    );
}
