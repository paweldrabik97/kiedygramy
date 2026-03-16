using System.ComponentModel.DataAnnotations;

namespace kiedygramy.Domain
{
    public class Genre
    {
        public int Id { get; set; }

        // fallback
        [Required]
        public string Name { get; set; } = "";

        public ICollection<GameGenre> GameGenres { get; set; } = new List<GameGenre>();

        // Translation navigation property
        public ICollection<GenreTranslation> Translations { get; set; } = new List<GenreTranslation>();

    }
}
