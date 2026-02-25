using kiedygramy.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace kiedygramy.Data.Configurations
{
    public class UserGameConfiguration : IEntityTypeConfiguration<UserGame>
    {
        public void Configure(EntityTypeBuilder<UserGame> builder)
        {
            builder.HasKey(ug => new { ug.UserId, ug.GameId });

            builder.HasOne(ug => ug.User)
                   .WithMany(u => u.UserGames)
                   .HasForeignKey(ug => ug.UserId);

            builder.HasOne(ug => ug.Game)
                   .WithMany(g => g.UserGames)
                   .HasForeignKey(ug => ug.GameId);
        }
    }
}
