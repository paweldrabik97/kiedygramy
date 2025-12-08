using kiedygramy.Data;
using kiedygramy.Domain;
using kiedygramy.Services.Auth;
using kiedygramy.Services.Games;
using kiedygramy.Services.Sessions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using System;
using kiedygramy.Services.Chat;
using kiedygramy.Hubs;

namespace kiedygramy.src.KiedyGramy.Api
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
          

            builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

            builder.Services.AddScoped<IAuthService, AuthService>();
            builder.Services.AddScoped<IGameService, GameService>();
            builder.Services.AddScoped<ISessionService, SessionService>();
            builder.Services.AddScoped<ISessionChatService, SessionChatService>();
            

            builder.Services.
                AddIdentityCore<User>(options => 
                {
                    options.Password.RequireDigit = false;
                    options.Password.RequireLowercase = false;
                    options.Password.RequireNonAlphanumeric = false;
                    options.Password.RequireUppercase = false;
                    options.Password.RequiredLength = 6;
                    options.User.RequireUniqueEmail = true;
                })
                .AddRoles<IdentityRole<int>>()
                .AddEntityFrameworkStores<AppDbContext>()
                .AddSignInManager<SignInManager<User>>()
                .AddDefaultTokenProviders();

            builder.Services.AddSingleton<TimeProvider>(TimeProvider.System);
            builder.Services.AddDataProtection();

            builder.Services
                .AddAuthentication(IdentityConstants.ApplicationScheme)
                .AddCookie(IdentityConstants.ApplicationScheme, options =>
                {
                    options.Cookie.Name = "KiedyGramyAuthCookie";
                    options.Cookie.HttpOnly = true;
                    options.Cookie.SameSite = SameSiteMode.Lax;
                });

            builder.Services.AddAuthorization();

            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
                });

            builder.Services.AddSignalR();

            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            using (var scope = app.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                await db.Database.MigrateAsync();
          
            }
          
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // --- Poczatek bloku migracji ---
            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                try
                {
                    var context = services.GetRequiredService<AppDbContext>(); // Podstaw nazwę swojego DbContextu
                    
                    // Ta komenda robi to samo co "dotnet ef database update"
                    context.Database.Migrate(); 
                }
                catch (Exception ex)
                {
                    var logger = services.GetRequiredService<ILogger<Program>>();
                    logger.LogError(ex, "Wystąpił błąd podczas migracji bazy danych.");
                }
            }
            // --- Koniec bloku migracji ---

            app.UseHttpsRedirection();
            app.UseAuthorization();

            app.MapControllers();

            app.MapHub<SessionChatHub>("/chatHub");

            await app.RunAsync();
        }
    }
}
