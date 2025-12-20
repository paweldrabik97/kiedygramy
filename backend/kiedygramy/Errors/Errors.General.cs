using kiedygramy.DTO.Common;

namespace kiedygramy.Application.Errors
{
    public static partial class Errors
    {
        public static class General
        {

            public static ErrorResponseDto NotFound(string entityName) =>
                   new(
                       status: 404,
                       title: "Not Found",
                       detail: $"{entityName} not found."
                   );

            public static ErrorResponseDto Forbidden(string detail = "Brak uprawnień") =>
                new(
                    status: 403,
                    title: "Forbiden",
                    detail: detail
                );

            public static ErrorResponseDto Internal(string detail = "Wystąpił nieoczekiwany błąd") =>
                new(
                    status: 500,
                    title: "Internal Server Error",
                    detail: detail
                );

            public static ErrorResponseDto Unauthorized(string detail = "Nie jesteś zalogowany lub sesja wygasła.") =>
                new(
                    status: 401,
                    title: "Unauthorized",
                    detail: detail
                );

            public static ErrorResponseDto Validation(string detail, string? field = null)
            {
                Dictionary<string, string[]>? errors = null;

                if (!string.IsNullOrWhiteSpace(field))
                {
                    errors = new Dictionary<string, string[]>
                    {
                        { field, new[] { detail } }
                    };
                }

                return new ErrorResponseDto(
                    status: 400,
                    title: "Validation Failed",
                    detail: detail,
                    errors: errors
                );
            }
            public static ErrorResponseDto Validation(string detail, IDictionary<string, string[]> errors) =>
                new(
                   status: 400,
                   title: "Validation Failed",
                   detail: detail,
                   instance: null,
                   errors: errors
                );
        }
    }
}
