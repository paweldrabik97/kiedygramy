using kiedygramy.DTO.Common;

namespace kiedygramy.Application.Errors
{
    public static partial class Errors
    {
        public static class Session
        {

            public static ErrorResponseDto NotFound() =>
                    General.NotFound("Sesja");
            public static ErrorResponseDto GameNotFound() =>
                 General.Validation(
                    detail: "podana gra nie istnieje",
                    field: "gameId"
                 );
            public static ErrorResponseDto AlreadyParticipant() =>
                General.Validation(
                    detail: "Użytkownik jest już uczestnikiem sesji",
                    field: "Participant"
                );
            public static ErrorResponseDto InvitationNotFound() =>
               General.NotFound("Zaproszenie");
            public static ErrorResponseDto NotOwner() =>
                General.Forbidden("Tylko właściciel sesji może wykonać tą operacje");

            public static ErrorResponseDto InvalidInvitationStatus() =>
                General.Validation(
                    detail: "nieprawidłowy status zaproszenia",
                    field: "Status"
                );
            public static ErrorResponseDto InvalidAvailabilityRange() =>
                new ErrorResponseDto(
                    status: 400,
                    title: "Validation Failed",
                    detail: "Nieprawidłowy zakres dostępności",
                    errors: new Dictionary<string, string[]>
                    {
                        { "From", new[] { "Data początkowa nie może być późniejsza niż końcowa" } },
                        { "To", new[] { "Data końcowa nie może być wcześniejsza niż początkowa" } }
                    }
                );
            public static ErrorResponseDto InvalidAvailabilityDeadline() =>
                General.Validation(
                    detail: "Termin zgłaszania dostępności musi być w przyszłości",
                    field: "Deadline"
                );
            public static ErrorResponseDto AvailabilityStillOpen() =>
                new(400, "Validation Failed", "Nie można ustawić finalnej daty przed upływem terminu zgłaszania dostępności.");
            public static ErrorResponseDto AvailabilityNotConfigured() =>
                General.Validation(
                    detail: "Dostępność nie została skonfigurowana"
                );
            public static ErrorResponseDto InvalidParticipant() =>
                General.Forbidden("detail");
            public static ErrorResponseDto FinalDateInPast() =>
               General.Validation(
                   detail: "Ostateczna data i godzina muszą być w przyszłości.",
                   field: "DateTime"
               );
            public static ErrorResponseDto FinalDateOutsideAvailability() =>
                General.Validation(
                    detail: "Ostateczna data musi mieścić się w ustalonym oknie dostępności.",
                    field: "DateTime"
                );
            public static ErrorResponseDto TitleRequired() =>
                General.Validation(
                    detail: "Tytuł jest wymagany.",
                    field: "Title"
                );
            public static ErrorResponseDto InvitedUserNotFound() =>
                General.Validation(
                    detail: "Użytkownik o podanej nazwie lub adresie e-mail nie istnieje.",
                    field: "UsernameOrEmail"
                );
            public static ErrorResponseDto FinalDateNotSet() =>
                General.Validation(
                    detail: "Data jeszcze nie została wybrana",
                    field: "DateTime"
                );
            public static ErrorResponseDto InvalidAttendanceStatus() =>
                General.Validation(
                    detail: "Nieprawidłowy status uczestnictwa",
                    field: "AttendanceStatus"
                );
            // powinno być 409 alo 400 ewentualnie dodać General.conflict
            public static ErrorResponseDto SessionAlreadyHappend() =>
                General.Validation(
                    detail: "Sesja już się odbyła, nie można zmienić statusu",
                    field: "DateTime"
                );
        }
    }
}
