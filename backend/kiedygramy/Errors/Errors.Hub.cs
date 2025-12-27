using kiedygramy.DTO.Common;


namespace kiedygramy.Application.Errors
{
    public static partial class Errors
    {
        public static class Hub
        {
            public static ErrorResponseDto InvalidSessionId() => General.Validation(
                detail: "Nieprawidłowy identyfikator sesji.",
                field: "SessionId"
            );

            public static ErrorResponseDto InvalidUser() => General.Unauthorized(
                    detail: "Brak zalogowanego użytkownika lub nieprawidłowy identyfikator."
            );

            public static ErrorResponseDto SessionChatForbidden() => General.Forbidden(
                    detail: "Brak dostępu do czatu tej sesji."
            );
        }
    }
}
