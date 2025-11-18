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
                .HasOne(g => g.Owner)
                .WithMany(u => u.Games)
                .HasForeignKey(g => g.OwnerId)
                .OnDelete(DeleteBehavior.Cascade);



        }

    }


}
    
        
    

