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


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        { 
            base.OnModelCreating(modelBuilder);


            modelBuilder.Entity<Session>()
                .HasMany(s => s.Participants)
                .WithMany(u => u.Sessions)
                .UsingEntity(j => j.ToTable("UserSessions"));
        }

    }


}
    
        
    

