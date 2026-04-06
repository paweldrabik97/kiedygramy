using kiedygramy.DTO.Common;

namespace kiedygramy.Application.Errors
{
    public static partial class Errors
    {
        public static class Email
        {
            public static ErrorResponseDto FailedToConnectSmtp() =>
                General.Internal(detail: "nie udało się wysłać emaila.");
            

        }
    }
}
