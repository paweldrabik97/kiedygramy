namespace kiedygramy.DTO.Session
{
    public record AvailabilitySummaryDayDto(
        DateTime Date,
        int AvailabilityCount);

    public record AvailabilitySummaryDto(
        List<AvailabilitySummaryDayDto> Days);
    
    
}
