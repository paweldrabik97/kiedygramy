using kiedygramy.Migrations;
using kiedygramy.Domain.Enums;

namespace kiedygramy.DTO.Session
{
    public record UpdateAttendanceDto
    (
        AttendanceStatus Status
    );
}
