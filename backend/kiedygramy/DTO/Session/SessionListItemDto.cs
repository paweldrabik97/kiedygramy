namespace kiedygramy.DTO.Session
{
    public record SessionListItemDto(
        int Id,
        string Title,
        DateTime? Date,
        string? Location,
        int AttendingCount);
}
