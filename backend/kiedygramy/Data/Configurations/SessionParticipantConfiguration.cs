using kiedygramy.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace kiedygramy.Data.Configurations;

public class SessionParticipantConfiguration : IEntityTypeConfiguration<SessionParticipant>
{
    public void Configure(EntityTypeBuilder<SessionParticipant> b)
    {
        b.Property(sp => sp.Role).HasConversion<string>();
        b.Property(sp => sp.Status).HasConversion<string>();

        b.HasOne(sp => sp.Session)
         .WithMany(s => s.Participants)
         .HasForeignKey(sp => sp.SessionId)
         .OnDelete(DeleteBehavior.Cascade);

        b.HasOne(sp => sp.User)
         .WithMany(u => u.SessionParticipants)
         .HasForeignKey(sp => sp.UserId)
         .OnDelete(DeleteBehavior.Restrict);

        b.HasIndex(sp => new { sp.SessionId, sp.UserId }).IsUnique();
    }
}



