using FluentAssertions;
using kiedygramy.Data;
using kiedygramy.Domain;
using kiedygramy.DTO.Guest;
using kiedygramy.DTO.Session.Create;
using kiedygramy.DTO.Session.Details;
using kiedygramy.Tests.Helpers;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Net.Http.Json;

namespace kiedygramy.Tests.Tests
{
    public class GuestTests : IClassFixture<WebAppFactory>, IAsyncLifetime
    {
        private readonly HttpClient _client;
        private readonly WebAppFactory _factory;

        private Task<HttpResponseMessage> LoginAsync(string username = "testuser")
            => TestHelpers.RegisterAndLoginAsync(_client, _factory, username);

        private async Task<int> CreateSessionAndGetIdAsync(string title = "Game Night")
        {
            var request = new CreateSessionRequest(
                Title: title,
                Date: null,
                Location: null,
                Description: null,
                GameIds: null
            );
            var response = await _client.PostAsJsonAsync("/api/my/sessions", request);
            var session = await response.Content.ReadFromJsonAsync<SessionDetailsResponse>();
            return session!.Id;
        }

        private async Task<string> GenerateInviteLinkTokenAsync(int sessionId)
        {
            var response = await _client.PostAsync(
                $"/api/guest/{sessionId}/generate-invite-link", null);
            var link = await response.Content.ReadFromJsonAsync<InviteLinkResponse>();
            return link!.Token;
        }

        private HttpClient CreateAnonClient() =>
            _factory.CreateClient(new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false,
                HandleCookies = true
            });

        public GuestTests(WebAppFactory factory)
        {
            _client = factory.CreateClient(new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false,
                HandleCookies = true
            });
            _factory = factory;
        }

        public async Task InitializeAsync()
        {
            using var scope = _factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await db.Sessions.ExecuteDeleteAsync();
            await db.Games.ExecuteDeleteAsync();
            await db.Users.ExecuteDeleteAsync();
        }

        public Task DisposeAsync() => Task.CompletedTask;


        [Fact]
        public async Task GenerateInviteLink_AsOwner_ReturnsOk()
        {
            await LoginAsync();
            var sessionId = await CreateSessionAndGetIdAsync();

            var result = await _client.PostAsync(
                $"/api/guest/{sessionId}/generate-invite-link", null);

            result.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task GenerateInviteLink_WhenUnauthenticated_ReturnsUnauthorized()
        {
            var result = await _client.PostAsync(
                "/api/guest/1/generate-invite-link", null);

            result.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task GenerateInviteLink_WithNonExistentSession_ReturnsNotFound()
        {
            await LoginAsync();

            var result = await _client.PostAsync(
                "/api/guest/99999/generate-invite-link", null);

            result.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task GenerateInviteLink_AsNonOwner_ReturnsForbidden()
        {
            await LoginAsync("owner");
            var sessionId = await CreateSessionAndGetIdAsync();

            await LoginAsync("nonowner");

            var result = await _client.PostAsync(
                $"/api/guest/{sessionId}/generate-invite-link", null);

            result.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        }


        [Fact]
        public async Task JoinAsGuest_WithValidToken_ReturnsOk()
        {
            await LoginAsync();
            var sessionId = await CreateSessionAndGetIdAsync();
            var token = await GenerateInviteLinkTokenAsync(sessionId);

            var anonClient = CreateAnonClient();
            var result = await anonClient.PostAsJsonAsync(
                $"/api/guest/join-as-guest?token={token}",
                new JoinAsGuestRequest("Player1")
            );

            result.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task JoinAsGuest_WithInvalidToken_ReturnsNotFound()
        {
            var anonClient = CreateAnonClient();
            var result = await anonClient.PostAsJsonAsync(
                "/api/guest/join-as-guest?token=invalid-token-xyz",
                new JoinAsGuestRequest("Player1")
            );

            result.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task JoinAsGuest_WithExpiredToken_ReturnsGone()
        {
            await LoginAsync();
            var sessionId = await CreateSessionAndGetIdAsync();
            var token = await GenerateInviteLinkTokenAsync(sessionId);

            using var scope = _factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var link = await db.SessionInviteLinks.FirstAsync(l => l.Token == token);
            link.ExpiresAt = DateTime.UtcNow.AddDays(-1);
            await db.SaveChangesAsync();

            var anonClient = CreateAnonClient();
            var result = await anonClient.PostAsJsonAsync(
                $"/api/guest/join-as-guest?token={token}",
                new JoinAsGuestRequest("Player1")
            );

            result.StatusCode.Should().Be(HttpStatusCode.Gone);
        }


        [Fact]
        public async Task JoinAsRegisteredUser_WithValidToken_ReturnsNoContent()
        {
            await LoginAsync("owner");
            var sessionId = await CreateSessionAndGetIdAsync();
            var token = await GenerateInviteLinkTokenAsync(sessionId);

            await LoginAsync("invitee");

            var result = await _client.PostAsJsonAsync(
                $"/api/guest/join-as-guest?token={token}",
                new JoinAsGuestRequest("ignored")
            );

            result.StatusCode.Should().Be(HttpStatusCode.NoContent);
        }


        [Fact]
        public async Task RejoinAsGuest_WithValidCode_ReturnsNoContent()
        {
            await LoginAsync();
            var sessionId = await CreateSessionAndGetIdAsync();
            var token = await GenerateInviteLinkTokenAsync(sessionId);

            var anonClient = CreateAnonClient();
            var joinResponse = await anonClient.PostAsJsonAsync(
                $"/api/guest/join-as-guest?token={token}",
                new JoinAsGuestRequest("Player1")
            );
            var guestData = await joinResponse.Content.ReadFromJsonAsync<JoinAsGuestResponse>();

            var freshClient = CreateAnonClient();
            var result = await freshClient.PostAsJsonAsync(
                "/api/guest/rejoin-as-guest",
                new RejoinAsGuestRequest(guestData!.GuestCode)
            );

            result.StatusCode.Should().Be(HttpStatusCode.NoContent);
        }

        [Fact]
        public async Task RejoinAsGuest_WithInvalidCode_ReturnsNotFound()
        {
            var anonClient = CreateAnonClient();
            var result = await anonClient.PostAsJsonAsync(
                "/api/guest/rejoin-as-guest",
                new RejoinAsGuestRequest("invalid-code")
            );

            result.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }
    }
}
