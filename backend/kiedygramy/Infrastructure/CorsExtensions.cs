namespace kiedygramy.Infrastructure
{
    public static class CorsExtensions
    {
        public static IServiceCollection AddAppCors(this IServiceCollection services, IConfiguration config)
        {
            var originsString = config["Frontend:Origin"] ?? "http://localhost:5173";

            var allowedOrigins = originsString
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(o => o.Trim())
                .ToArray();

            services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy.WithOrigins(allowedOrigins)
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                });
            });

            return services;
        }
    }
}