using kiedygramy.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace kiedygramy.Data.Configurations
{
    public class GenreTranslationConfiguration :IEntityTypeConfiguration<GenreTranslation>
    {
        public void Configure(EntityTypeBuilder<GenreTranslation> b)
        {
            b.ToTable("GenreTranslations");

            b.Property(gt => gt.LanguageCode)
                .IsRequired()
                .HasMaxLength(5);
            b.Property(gt => gt.Name)
                .IsRequired()
                .HasMaxLength(80);

            b.HasIndex(gt => new { gt.GenreId, gt.LanguageCode })
                .IsUnique();
        }
    }
}
