using kiedygramy.Data;
using kiedygramy.Services.Email;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using System.Threading.RateLimiting;
using Testcontainers.PostgreSql;




public class WebAppFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder("postgres:16").Build();
    


    public async Task InitializeAsync()
    {
        await _postgres.StartAsync();

        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
           
            var descriptor = services.SingleOrDefault(d =>
                d.ServiceType == typeof(DbContextOptions<AppDbContext>));

            if (descriptor != null)
                services.Remove(descriptor);

            services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(_postgres.GetConnectionString()));

            var emailDescriptor = services.SingleOrDefault(d =>
                d.ServiceType == typeof(IEmailService));

            if (emailDescriptor != null)
                services.Remove(emailDescriptor);

            services.AddTransient<IEmailService, FakeEmailService>();

            services.Configure<CookieAuthenticationOptions>(IdentityConstants.ApplicationScheme, options =>
            {
                options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
                options.Cookie.SameSite = SameSiteMode.Lax;
            });

            var rateLimiterDescriptors = services
                .Where(d => d.ServiceType == typeof(IConfigureOptions<RateLimiterOptions>))
                .ToList();
            foreach (var d in rateLimiterDescriptors)
                services.Remove(d);

            services.Configure<RateLimiterOptions>(options =>
            {
                options.AddPolicy("auth", _ => RateLimitPartition.GetNoLimiter("test"));
                options.AddPolicy("account", _ => RateLimitPartition.GetNoLimiter("test"));
            });

        });
    }

    public new async Task DisposeAsync()
    {
        await _postgres.StopAsync();
    }
}
