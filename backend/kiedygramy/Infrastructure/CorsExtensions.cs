
namespace kiedygramy.Infrastructure
{
    public static class CorsExtensions
    {
        public static IServiceCollection AddAppCors(this IServiceCollection services, IConfiguration config)
        {
            //Narazie tak, a później to trzeba będzie przenieść do appsettings?
            var origin = config["Frontend:Origin"] ?? "http://localhost:5173";

            services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy.WithOrigins(origin)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
                });
            });

            return services;
        }
    }
}
