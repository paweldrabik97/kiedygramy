using kiedygramy.DTO.Common;
using Microsoft.AspNetCore.Identity;

namespace kiedygramy.Application.Errors
{
    public static partial class Errors
    {
        public static class Auth
        {
            public static ErrorResponseDto InvalidCredentials() =>
                   General.Unauthorized("Nieprawidłowy login lub hasło.");

            public static ErrorResponseDto UsernameTaken() =>
                General.Validation("Użytkownik o podanej nazwie już istnieje.", field: "Username");

            public static ErrorResponseDto EmailTaken() =>
                General.Validation("Użytkownik o podanym e-mailu już istnieje.", field: "Email");

            public static ErrorResponseDto IdentityValidation(IEnumerable<IdentityError> identityErrors)
            {

                var dict = new Dictionary<string, List<string>>();

                foreach (var e in identityErrors)
                {
                    var field = GuessField(e.Code);
                    if (!dict.TryGetValue(field, out var list))
                    {
                        list = new List<string>();
                        dict[field] = list;
                    }
                    list.Add(e.Description);
                }

                var errors = dict.ToDictionary(k => k.Key, v => v.Value.Distinct().ToArray());

                return General.Validation(
                    detail: "Rejestracja nie powiodła się. Popraw dane i spróbuj ponownie.",
                    errors: errors
                );
            }

            private static string GuessField(string code)
            {
                if (code.Contains("Password", StringComparison.OrdinalIgnoreCase)) return "Password";
                if (code.Contains("Email", StringComparison.OrdinalIgnoreCase)) return "Email";
                if (code.Contains("UserName", StringComparison.OrdinalIgnoreCase)) return "Username";
                return "General";
            }
        }
    }
}
