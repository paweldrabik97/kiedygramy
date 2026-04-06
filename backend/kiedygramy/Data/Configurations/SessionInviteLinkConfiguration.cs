using kiedygramy.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace kiedygramy.Data.Configurations
{
    public class SessionInviteLinkConfiguration : IEntityTypeConfiguration<SessionInviteLink>
    {      
        public void Configure(EntityTypeBuilder<SessionInviteLink> b)
        {
            b.HasIndex(x => x.Token).IsUnique();
            b.Property(x => x.Token).HasMaxLength(128);

            b.HasOne(x => x.Session)
                .WithMany(x => x.InviteLinks)
                .HasForeignKey(x => x.SessionId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
