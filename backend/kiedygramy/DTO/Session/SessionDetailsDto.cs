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
        int? GameId,
        string? GameTitle,
        DateTime? AvailabilityFrom,
        DateTime? AvailabilityTo,
        DateTime? AvailabilityDeadline
        );
}
