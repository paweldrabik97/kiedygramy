using kiedygramy.DTO.Common;


namespace kiedygramy.Application.Errors
{
    public static partial class Errors
    {
        public static class Chat
        {
            public static ErrorResponseDto NotFound() =>
                General.NotFound("Sesja");
            public static ErrorResponseDto InvalidParticipant() =>
                General.Forbidden("Nie jesteś uczestnikiem tej sesji.");
            public static ErrorResponseDto InvalidLimit() =>
                General.Validation("Limit musi być w zakresie 1-100.", "limit");
            public static ErrorResponseDto EmptyMessage() =>
            General.Validation(
                detail: "Treść wiadomości nie może być pusta.",
                field: "Text"
            );
        }
    }
}
