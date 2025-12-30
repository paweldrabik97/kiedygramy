using kiedygramy.Data;
using kiedygramy.Services.Account;
using kiedygramy.Services.Auth;
using kiedygramy.Services.Chat;
using kiedygramy.Services.External;
using kiedygramy.Services.Games;
using kiedygramy.Services.Genre;
using kiedygramy.Services.Notifications;
using kiedygramy.Services.Sessions;
using Microsoft.EntityFrameworkCore;

namespace kiedygramy.Infrastructure
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddAppDb(this IServiceCollection services, IConfiguration config)
        { 
            services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(config.GetConnectionString("DefaultConnection")));

            return services;
        }

        public static IServiceCollection AddAppServices(this IServiceCollection services)
        {
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IAccountService, AccountService>();

            services.AddScoped<IGameService, GameService>();
            services.AddScoped<ISessionService, SessionService>();
            services.AddScoped<ISessionChatService, SessionChatService>();
            services.AddScoped<IGenreService, GenreService>();

            services.AddScoped<ISessionChatHubService, SessionChatHubService>();
            services.AddScoped<INotificationService, NotificationService>();
            services.AddScoped<INotificationPublisher, SignalRNotificationPublisher>();

            services.AddSingleton<TimeProvider>(TimeProvider.System);
            services.AddDataProtection();

            return services;
        }

        public static IServiceCollection AddBggClient(this IServiceCollection services)
        {
            services.AddHttpClient<IBoardGameGeekClientService, BoardGameGeekClientService>((sp, client) =>
            {
                var config = sp.GetRequiredService<IConfiguration>();

                client.BaseAddress = new Uri(config["BGG:BaseUrl"]!);
                client.DefaultRequestHeaders.Authorization =
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", config["BGG:Token"]);
                client.Timeout = TimeSpan.FromSeconds(10);
            });

            return services;
        }

        public static IServiceCollection AddAppControllersAndSignalR(this IServiceCollection services)
        {
            services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
                });

            services.AddSignalR()
                .AddJsonProtocol(options =>
                {
                    options.PayloadSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
                });

            return services;
        }

        public static IServiceCollection AddAppSwagger(this IServiceCollection services)
        {
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen();
            return services;
        }
    }
}
