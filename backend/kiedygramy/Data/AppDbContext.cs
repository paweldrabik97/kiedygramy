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
        public DbSet<SessionMessage> SessionMessages { get; set; } = default!;
        public DbSet<SessionAvailability> SessionAvailabilities => Set<SessionAvailability>();


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        { 
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.NormalizedEmail)
                .IsUnique();

            modelBuilder.Entity<Session>()
                .HasOne(s => s.Owner)
                .WithMany(u => u.OwnedSessions)
                .HasForeignKey(s => s.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Session>()
                .HasOne(s => s.Game)
                .WithMany(g => g.Sessions)
                .HasForeignKey(s => s.GameId)
                .OnDelete(DeleteBehavior.SetNull);

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
                .OnDelete(DeleteBehavior.Cascade);

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




        }

    }


}
    
        
    

