using kiedygramy.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace kiedygramy.Data.Configurations;

public class GameGenreConfiguration : IEntityTypeConfiguration<GameGenre>
{
    public void Configure(EntityTypeBuilder<GameGenre> b)
    {
        b.HasKey(x => new { x.GameId, x.GenreId });

        b.HasOne(x => x.Game)
         .WithMany(x => x.GameGenres)
         .HasForeignKey(x => x.GameId);

        b.HasOne(x => x.Genre)
         .WithMany(x => x.GameGenres)
         .HasForeignKey(x => x.GenreId);
    }
}
