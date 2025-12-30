namespace kiedygramy.DTO.Session.List
{
    public record SessionListItemResponse(

        int Id,
        string Title,
        DateTime? Date,
        string? Location,
        int AttendingCount

    );
}
