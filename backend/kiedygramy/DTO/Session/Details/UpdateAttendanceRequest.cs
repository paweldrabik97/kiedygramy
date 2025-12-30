using kiedygramy.Migrations;
using kiedygramy.Domain.Enums;

namespace kiedygramy.DTO.Session.Details
{
    public record UpdateAttendanceRequest
    (
        AttendanceStatus Status
    );
}
