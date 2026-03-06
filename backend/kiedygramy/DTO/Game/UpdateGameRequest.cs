using System.ComponentModel.DataAnnotations;

namespace kiedygramy.DTO.Game
{
    public record UpdateGameRequest
    {
        [MaxLength(100, ErrorMessage = "Local title can be max 100 characters long")]
        public string? LocalTitle { get; init; }

        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5")]
        public int? Rating { get; init; }

        [MaxLength(100, ErrorMessage = "Title can be max 100 characters long")]
        public string? Title { get; init; }

        public List<int>? GenreIds { get; init; }

        [Range(1, 20, ErrorMessage = "Number of players must be between 1 and 20")]
        public int? MinPlayers { get; init; }

        [Range(1, 20, ErrorMessage = "Number of players must be between 1 and 20")]
        public int? MaxPlayers { get; init; }

        public string? ImageUrl { get; init; }

        public string? PlayTime { get; init; }
    }
}