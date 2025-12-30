using System.Threading.RateLimiting;


namespace kiedygramy.Infrastructure
{
    public static class RateLimitingExtensions
    {
        public static IServiceCollection AddAppRateLimiting(this IServiceCollection services)
        {
            services.AddRateLimiter(options =>
            {
                options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

                options.AddPolicy(RateLimitPolicies.Auth, ctx => 
                {
                    var ip = ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                    return RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 10,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 0
                    });
                });

                options.AddPolicy(RateLimitPolicies.Account, ctx =>
                {
                    var userId = ctx.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                    var key = userId ?? (ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown");

                    return RateLimitPartition.GetFixedWindowLimiter(key, _ => new FixedWindowRateLimiterOptions
                    { 
                        PermitLimit = 50,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 0
                    });
                });
            });

            return services;
        }

        public static class RateLimitPolicies
        {
            public const string Auth = "auth";
            public const string Account = "account";
        }
    }
}
