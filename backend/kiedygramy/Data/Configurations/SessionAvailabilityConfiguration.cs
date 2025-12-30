using kiedygramy.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace kiedygramy.Data.Configurations;

public class SessionAvailabilityConfiguration : IEntityTypeConfiguration<SessionAvailability>
{
    public void Configure(EntityTypeBuilder<SessionAvailability> b)
    {
        b.HasOne(a => a.Session)
         .WithMany(s => s.Availabilities)
         .HasForeignKey(a => a.SessionId)
         .OnDelete(DeleteBehavior.Cascade);

        b.HasOne(a => a.User)
         .WithMany()
         .HasForeignKey(a => a.UserId)
         .OnDelete(DeleteBehavior.Cascade);

        b.HasIndex(a => new { a.SessionId, a.UserId, a.Date }).IsUnique();
    }
}
