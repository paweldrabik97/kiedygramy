using System.ComponentModel.DataAnnotations;

namespace kiedygramy.Domain
{
    public class GenreTranslation
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(5)]
        // Language code (e.g., "en", "pl", "es")
        public string LanguageCode { get; set; } = "";

        [Required]
        // Translated name of the genre
        public string Name { get; set; } = "";

        // Foreign key to Genre
        public int GenreId { get; set; }

        // Navigation property back to Genre
        public Genre Genre { get; set; } = null!;
    }
}