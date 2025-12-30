using kiedygramy.Data;
using Microsoft.EntityFrameworkCore;

namespace kiedygramy.Infrastructure
{
    public static class ApplicationBuilderExtensions
    {
        public static IApplicationBuilder UseAppSwagger(this IApplicationBuilder app)
        { 
            app.UseSwagger();
            app.UseSwaggerUI();
            return app;
        }

        public static async Task<WebApplication> MigrateDatabaseAsync(this WebApplication app)
        { 
            using var scope = app.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await db.Database.MigrateAsync();
            return app;
        }
    }
}
