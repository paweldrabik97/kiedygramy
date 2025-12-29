using kiedygramy.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;



namespace kiedygramy.Data
{
    public class AppDbContext : IdentityDbContext<User, IdentityRole<int>, int>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        
     
        public DbSet<Game> Games => Set<Game>();
        public DbSet<Session> Sessions => Set<Session>();
        public DbSet<SessionParticipant> SessionParticipants => Set<SessionParticipant>();
        public DbSet<SessionMessage> SessionMessages => Set<SessionMessage>();
        public DbSet<SessionAvailability> SessionAvailabilities => Set<SessionAvailability>();
        public DbSet<Genre> Genres => Set<Genre>();
        public DbSet<GameGenre> GameGenres => Set<GameGenre>();
        public DbSet<Notification> Notifications => Set<Notification>();
        public DbSet<SessionGameVote> SessionGameVotes => Set<SessionGameVote>();


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(b =>
            {
                b.Property(u => u.FullName).HasMaxLength(200).IsUnicode();
                b.Property(u => u.City).HasMaxLength(100).IsUnicode();
            });

            modelBuilder.Entity<Session>()
                .HasOne(s => s.Owner)
                .WithMany(u => u.OwnedSessions)
                .HasForeignKey(s => s.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Session>()
                .HasMany(s => s.Games)
                .WithMany(g => g.Sessions)
                .UsingEntity<Dictionary<string, object>>(
                    "SessionGame",
                    j => j
                        .HasOne<Game>()
                        .WithMany()
                        .HasForeignKey("GameId")
                        .OnDelete(DeleteBehavior.Cascade),
                    j => j
                        .HasOne<Session>()
                        .WithMany()
                        .HasForeignKey("SessionId")
                        .OnDelete(DeleteBehavior.Cascade));

            modelBuilder.Entity<SessionParticipant>()
                .Property(sp => sp.Role)
                .HasConversion<string>();

            modelBuilder.Entity<SessionParticipant>()
                .Property(sp => sp.Status)
                .HasConversion<string>();

            modelBuilder.Entity<SessionParticipant>()
                .HasOne(sp => sp.Session)
                .WithMany(s => s.Participants)
                .HasForeignKey(sp => sp.SessionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SessionParticipant>()
                .HasOne(sp => sp.User)
                .WithMany(u => u.SessionParticipants)
                .HasForeignKey(sp => sp.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SessionParticipant>()
                .HasIndex(sp => new { sp.SessionId, sp.UserId })
                .IsUnique();

            modelBuilder.Entity<Game>()
                .HasIndex(g => new { g.OwnerId, g.Title })
                .IsUnique();

            modelBuilder.Entity<Game>()
                .HasOne(g => g.Owner)
                .WithMany(u => u.Games)
                .HasForeignKey(g => g.OwnerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SessionGameVote>()
                .HasIndex(v => new { v.SessionId, v.UserId, v.GameKey })
                .IsUnique();

            modelBuilder.Entity<SessionMessage>()
                .HasOne(sm => sm.Session)
                .WithMany(s => s.Messages)
                .HasForeignKey(sm => sm.SessionId);

            modelBuilder.Entity<SessionMessage>()
                .HasOne(sm => sm.User)
                .WithMany()
                .HasForeignKey(sm => sm.UserId);

            modelBuilder.Entity<SessionAvailability>()
               .HasOne(a => a.Session)
               .WithMany(s => s.Availabilities)
               .HasForeignKey(a => a.SessionId)
               .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SessionAvailability>()
                .HasOne(a => a.User)
                .WithMany()
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SessionAvailability>()
                .HasIndex(a => new { a.SessionId, a.UserId, a.Date })
                .IsUnique();

            modelBuilder.Entity<Genre>(e =>
            {
                e.Property(x => x.Name).IsRequired().HasMaxLength(80);
                e.HasIndex(x => x.Name).IsUnique();
            });

            modelBuilder.Entity<GameGenre>(e =>
            {
                e.HasKey(x => new { x.GameId, x.GenreId });

                e.HasOne(x => x.Game)
                 .WithMany(x => x.GameGenres)
                 .HasForeignKey(x => x.GameId);

                e.HasOne(x => x.Genre)
                    .WithMany(x => x.GameGenres)
                    .HasForeignKey(x => x.GenreId);
            });

            modelBuilder.Entity<Notification>(b =>
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

            });
        }
    }
}
    
        
    

