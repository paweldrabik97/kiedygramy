using kiedygramy.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace kiedygramy.Data.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> b)
    {
        b.Property(x => x.Title).IsRequired().HasMaxLength(200);
        b.Property(x => x.Message).IsRequired().HasMaxLength(1000);
        b.Property(x => x.Url).HasMaxLength(500);
        b.Property(x => x.Key).HasMaxLength(200);

        b.Property(x => x.CreatedAt).IsRequired();
        b.Property(x => x.UpdatedAt).IsRequired();

        b.HasOne(x => x.User)
         .WithMany(u => u.Notifications)
         .HasForeignKey(x => x.UserId)
         .OnDelete(DeleteBehavior.Cascade);

        b.HasIndex(x => new { x.UserId, x.IsRead, x.UpdatedAt });
        b.HasIndex(x => new { x.UserId, x.Key, x.IsRead });
        b.HasIndex(x => new { x.UserId, x.Key }).IsUnique();
    }
}
