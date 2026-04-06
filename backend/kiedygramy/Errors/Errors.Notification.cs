using kiedygramy.DTO.Common;

namespace kiedygramy.Application.Errors
{
    public static partial class Errors
    {
        public static class Notifications
        {            
            public static ErrorResponseDto NotificationNotExists() =>
                General.NotFound("Nie znaleziono takiego powiadomienia");

            public static ErrorResponseDto InvalidUserId() =>
                General.Validation("Nieprawidłowy identifikator użytkownika", "UserId");

            public static ErrorResponseDto InvalidSessionId() =>
                General.Validation("Nieprawidłowy identifikator sesji", "SessionId");

            public static ErrorResponseDto TitleRequired() =>
                General.Validation("Tytuł jest wymagany", "Title");
        }
    }
}
