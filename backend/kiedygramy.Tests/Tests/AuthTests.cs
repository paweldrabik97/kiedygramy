using FluentAssertions;
using kiedygramy.Data;
using kiedygramy.DTO.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Net.Http.Json;
using kiedygramy.Domain;
using Microsoft.AspNetCore.Identity;


namespace kiedygramy.Tests.Tests;

public class AuthTests : IClassFixture<WebAppFactory>, IAsyncLifetime
{
    private readonly HttpClient _client;
    private readonly WebAppFactory _factory;

    public AuthTests(WebAppFactory factory)
    {
        _client = factory.CreateClient();
        _factory = factory;
    }

    public async Task InitializeAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Users.ExecuteDeleteAsync();     
    }

    public Task DisposeAsync() => Task.CompletedTask;

    [Fact]
    public async Task Register_WithValidData_ReturnsOk()
    {
        
        var request = new RegisterRequest
        (
            Username: "testuser",
            Email: "test@test.com",
            Password: "Test123!",
            FullName: "Jan Kowalski",
            City: "Warszawa",
            PrefferedLanguage: "pl"
        );
   
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);
        
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Register_WithExistingEmail_ReturnsBadRequest()
    {
        
        var request = new RegisterRequest
        (
            Username: "testuser",
            Email: "test@test.com",
            Password: "Test123!",
            FullName: "Jan Kowalski",
            City: "Warszawa",
            PrefferedLanguage: "pl"
        );
    
        var attemptOne = await _client.PostAsJsonAsync("/api/auth/register", request);
        var attemptTwo = await _client.PostAsJsonAsync("/api/auth/register", request);
      
        attemptTwo.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsNoContent()
    {
        
        var request = new RegisterRequest
       (
           Username: "testuser",
           Email: "test@test.com",
           Password: "Test123!",
           FullName: "Jan Kowalski",
           City: "Warszawa",
           PrefferedLanguage: "pl"
       );

        await _client.PostAsJsonAsync("/api/auth/register", request);
        using var scope = _factory.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var user = await userManager.FindByNameAsync(request.Username);

        user.EmailConfirmed = true;
        await userManager.UpdateAsync(user);

        var loginRequest = new LoginRequest
        (
            UsernameOrEmail: user.Email,
            Password: request.Password
        );

        var loginResult = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);
        loginResult.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ReturnsUnauthorized()
    {
        var request = new RegisterRequest
       (
           Username: "testuser",
           Email: "test@test.com",
           Password: "Test123!",
           FullName: "Jan Kowalski",
           City: "Warszawa",
           PrefferedLanguage: "pl"
       );

        await _client.PostAsJsonAsync("/api/auth/register", request);

        using var scope = _factory.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var user = await userManager.FindByNameAsync(request.Username);

        user.EmailConfirmed = true;
        await userManager.UpdateAsync(user);

        var loginRequest = new LoginRequest
        (
            UsernameOrEmail: user.Email,
            Password: "invalidPassword"
        );

        var loginResult = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);
        loginResult.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Login_WithUnconfirmedEmail_ReturnsUnauthorized()
    {
        var request = new RegisterRequest
       (
           Username: "testuser",
           Email: "test@test.com",
           Password: "Test123!",
           FullName: "Jan Kowalski",
           City: "Warszawa",
           PrefferedLanguage: "pl"
       );

        await _client.PostAsJsonAsync("/api/auth/register", request);

        using var scope = _factory.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var user = await userManager.FindByNameAsync(request.Username);

        var loginRequest = new LoginRequest
        (
            UsernameOrEmail: user.Email,
            Password: request.Password
        );

        var loginResult = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);
        loginResult.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
    [Fact]
    public async Task ConfirmEmail_WithValidToken_ReturnsNoContent()
    {
        var request = new RegisterRequest
       (
           Username: "testuser",
           Email: "test@test.com",
           Password: "Test123!",
           FullName: "Jan Kowalski",
           City: "Warszawa",
           PrefferedLanguage: "pl"
       );

        await _client.PostAsJsonAsync("/api/auth/register", request);

        using var scope = _factory.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var user = await userManager.FindByNameAsync (request.Username);

        var token = await userManager.GenerateEmailConfirmationTokenAsync(user);
        var encodedToken = Uri.EscapeDataString(token);

        var result = await _client.PostAsync($"api/auth/confirmation-email?email={request.Email}&token={encodedToken}", null);
        result.StatusCode.Should().Be(HttpStatusCode.NoContent);     
    }

    [Fact]
    public async Task ConfirmEmail_WithInvalidToken_ReturnsBadRequest()
    {
        var request = new RegisterRequest
       (
           Username: "testuser",
           Email: "test@test.com",
           Password: "Test123!",
           FullName: "Jan Kowalski",
           City: "Warszawa",
           PrefferedLanguage: "pl"
       );

        await _client.PostAsJsonAsync("/api/auth/register", request);

        var result = await _client.PostAsync($"api/auth/confirmation-email?email={request.Email}&token=InvalidToken", null);
        result.StatusCode.Should().Be(HttpStatusCode.BadRequest);

    }


    [Fact]
    public async Task ResendConfirmationEmial_WithValidEmail_ReturnsNoContent()
    {
        var request = new RegisterRequest
       (
           Username: "testuser",
           Email: "test@test.com",
           Password: "Test123!",
           FullName: "Jan Kowalski",
           City: "Warszawa",
           PrefferedLanguage: "pl"
       );

        var registerResult = await _client.PostAsJsonAsync("/api/auth/register", request);

        var result = await _client.PostAsync($"api/auth/resend-confirmation-email?email={request.Email}", null);
        result.StatusCode.Should().Be(HttpStatusCode.NoContent);

    }
}
