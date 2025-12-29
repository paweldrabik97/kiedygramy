namespace kiedygramy.DTO.Session
{
    public record SessionDetailsDto(
        int Id,
        string Title,
        DateTime? Date,
        string? Location,
        string? Description,
        int OwnerId,
        string OwnerUserName,
        List<SessionGameDto> Games,
        DateTime? AvailabilityFrom,
        DateTime? AvailabilityTo,
        DateTime? AvailabilityDeadline
        );
}
