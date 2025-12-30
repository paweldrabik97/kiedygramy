using kiedygramy.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace kiedygramy.Data.Configurations;

public class GameConfiguration : IEntityTypeConfiguration<Game>
{
    public void Configure(EntityTypeBuilder<Game> b)
    {
        b.HasIndex(g => new { g.OwnerId, g.Title }).IsUnique();

        b.HasOne(g => g.Owner)
         .WithMany(u => u.Games)
         .HasForeignKey(g => g.OwnerId)
         .OnDelete(DeleteBehavior.Cascade);
    }
}
