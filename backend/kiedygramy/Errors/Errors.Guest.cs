using kiedygramy.DTO.Common;


namespace kiedygramy.Application.Errors
{
    public static partial class Errors
    {
        public static class Guest
        {
            public static ErrorResponseDto LinkNotExists() =>
                General.NotFound("Link nie istnieje");

            public static ErrorResponseDto LinkExpired() =>
               General.Gone("Link wygasł");
        }
    }
}
