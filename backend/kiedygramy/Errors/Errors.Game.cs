using kiedygramy.DTO.Common;

namespace kiedygramy.Application.Errors
{
    public static partial class Errors
    {
        public static class Game
        {
            public static ErrorResponseDto NotFound() =>
                    General.NotFound("Gra");

            public static ErrorResponseDto DuplicateTitle() =>
                General.Validation(
                    detail: "Masz już grę o takim tytule.",
                    field: "Title"
                );

            public static ErrorResponseDto TitleRequired() =>
                General.Validation(
                    detail: "Tytuł jest wymagany.",
                    field: "Title"
                );

            public static ErrorResponseDto TitleLengthInvalid() =>
                General.Validation(
                    detail: "Tytuł gry musi mieć od 2 do 100 znaków.",
                    field: "Title"
                );

            public static ErrorResponseDto MinPlayersMustBeGreaterThanZero() =>
                General.Validation(
                    detail: "Minimalna liczba graczy musi być większa od 0.",
                    field: "MinPlayers"
                );

            public static ErrorResponseDto MaxPlayersMustBeGreaterOrEqualMin() =>
                General.Validation(
                    detail: "Maksymalna liczba graczy musi być większa lub równa minimalnej liczbie graczy.",
                    field: "MaxPlayers"
                );
            public static ErrorResponseDto ExternalNotFound() =>
                General.NotFound("Gra (zewnętrzna)");

            public static ErrorResponseDto ExternalInvalidData() =>
                General.Validation("Zewnętrzne API zwróciło nieprawidłowe dane.", "SourceId");

        }
    }
}
