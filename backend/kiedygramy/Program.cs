using kiedygramy.Hubs;
using kiedygramy.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAppDb(builder.Configuration);
builder.Services.AddAppServices();
builder.Services.AddBggClient();
builder.Services.AddAppIdentity();
builder.Services.AddAppControllersAndSignalR();
builder.Services.AddAppSwagger();
builder.Services.AddAppCors(builder.Configuration);
builder.Services.AddAppRateLimiting();
builder.Services.AddAppOptions(builder.Configuration);

var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.UseAppSwagger();
}

await app.MigrateDatabaseAsync();

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.UseRateLimiter();

app.MapHub<SessionChatHub>("/chatHub").RequireCors("AllowFrontend");
app.MapHub<NotificationHub>("/notificationHub").RequireCors("AllowFrontend");

app.MapControllers();

await app.RunAsync();

public partial class Program { }