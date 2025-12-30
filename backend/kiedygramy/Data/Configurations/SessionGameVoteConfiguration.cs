using kiedygramy.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace kiedygramy.Data.Configurations;

public class SessionGameVoteConfiguration : IEntityTypeConfiguration<SessionGameVote>
{
    public void Configure(EntityTypeBuilder<SessionGameVote> b)
    {
        b.HasIndex(v => new { v.SessionId, v.UserId, v.GameKey }).IsUnique();
    }
}
