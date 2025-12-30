namespace kiedygramy.DTO.Session.Availability
{
    public record AvailabilitySummaryDayDto(

        DateTime Date,
        int AvailabilityCount

    );

    public record AvailabilitySummaryResponse(List<AvailabilitySummaryDayDto> Days);
}
