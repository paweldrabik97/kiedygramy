using kiedygramy.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace kiedygramy.Data.Configurations;

public class SessionMessageConfiguration : IEntityTypeConfiguration<SessionMessage>
{
    public void Configure(EntityTypeBuilder<SessionMessage> b)
    {
        b.HasOne(sm => sm.Session)
         .WithMany(s => s.Messages)
         .HasForeignKey(sm => sm.SessionId);

        b.HasOne(sm => sm.User)
         .WithMany()
         .HasForeignKey(sm => sm.UserId);
    }
}
