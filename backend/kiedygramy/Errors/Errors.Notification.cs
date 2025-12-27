using kiedygramy.DTO.Common;

namespace kiedygramy.Application.Errors
{
    public static partial class Errors
    {
        public static class Notifications
        {            
            public static ErrorResponseDto NotificationNotExists() =>
                General.NotFound("Notification");

            public static ErrorResponseDto InvalidUserId() =>
                General.Validation("User");

            public static ErrorResponseDto InvalidSessionId() =>
                General.Validation("Session");

            public static ErrorResponseDto TitleRequired() =>
                General.Validation("Title");
        }
    }
}
