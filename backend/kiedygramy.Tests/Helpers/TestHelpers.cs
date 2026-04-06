using kiedygramy.DTO.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using System.Net.Http.Json;
using kiedygramy.Domain;


namespace kiedygramy.Tests.Helpers
{
    public class TestHelpers()
    {
        public const string DefaultPassword = "Test123!";
        public static async Task<HttpResponseMessage> RegisterAndLoginAsync (HttpClient client,WebAppFactory factory, string username = "testuser")
        {
            

            var registerRequest = new RegisterRequest(

                Username: username,
                Email: $"{username}@test.com",
                Password: DefaultPassword,
                FullName: "Jan Kowalski",
                City: "Warszawa",
                PrefferedLanguage: "pl"
            );

            using var scope = factory.Services.CreateScope();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
            var user = await userManager.FindByNameAsync(username);

            if (user is null)
            {
                var registerResponse = await client.PostAsJsonAsync("api/auth/register", registerRequest);
                if (!registerResponse.IsSuccessStatusCode)
                {
                    var body = await registerResponse.Content.ReadAsStringAsync();
                    throw new Exception($"Registration failed ({registerResponse.StatusCode}): {body}");
                }

                user = await userManager.FindByNameAsync(username);
                user!.EmailConfirmed = true;
                await userManager.UpdateAsync(user);
            }

            var loginRequest = new LoginRequest(

                UsernameOrEmail: user.Email,
                Password: DefaultPassword
            );

            return await client.PostAsJsonAsync("api/auth/login", loginRequest);

            
        }
    }
}
