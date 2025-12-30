using kiedygramy.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace kiedygramy.Data.Configurations;

    public class SessionConfiguration : IEntityTypeConfiguration<Session>
    {
        public void Configure(EntityTypeBuilder<Session> b)
        {
            b.HasOne(s => s.Owner)
         .WithMany(u => u.OwnedSessions)
         .HasForeignKey(s => s.OwnerId)
         .OnDelete(DeleteBehavior.Restrict);

            b.HasMany(s => s.Games)
             .WithMany(g => g.Sessions)
             .UsingEntity<Dictionary<string, object>>(
                 "SessionGame",
                 j => j.HasOne<Game>()
                       .WithMany()
                       .HasForeignKey("GameId")
                       .OnDelete(DeleteBehavior.Cascade),
                 j => j.HasOne<Session>()
                       .WithMany()
                       .HasForeignKey("SessionId")
                       .OnDelete(DeleteBehavior.Cascade
             ));
        }
    }

