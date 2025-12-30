namespace kiedygramy.DTO.Session.Details
{
    public record SessionDetailsResponse(
        
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
