using FluentAssertions;
using kiedygramy.Data;
using kiedygramy.DTO.Session.Create;
using kiedygramy.DTO.Session.Details;
using kiedygramy.DTO.Session.Invitations;
using kiedygramy.DTO.Session.List;
using kiedygramy.DTO.Session.Votes;
using kiedygramy.Domain;
using kiedygramy.Tests.Helpers;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Net.Http.Json;

namespace kiedygramy.Tests.Tests
{
    public class SessionTests : IClassFixture<WebAppFactory>, IAsyncLifetime
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

        public SessionTests(WebAppFactory factory)
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
        public async Task CreateSession_WithValidData_ReturnsCreated()
        {
            await LoginAsync();

            var request = new CreateSessionRequest(
                Title: "Game Night",
                Date: null,
                Location: "Warszawa",
                Description: null,
                GameIds: null
            );

            var result = await _client.PostAsJsonAsync("/api/my/sessions", request);

            result.StatusCode.Should().Be(HttpStatusCode.Created);
        }

        [Fact]
        public async Task CreateSession_WhenUnauthenticated_ReturnsUnauthorized()
        {
            var request = new CreateSessionRequest(
                Title: "Game Night",
                Date: null,
                Location: null,
                Description: null,
                GameIds: null
            );

            var result = await _client.PostAsJsonAsync("/api/my/sessions", request);

            result.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }


        [Fact]
        public async Task GetMine_ReturnsOkWithSessions()
        {
            await LoginAsync();
            await CreateSessionAndGetIdAsync("Session 1");
            await CreateSessionAndGetIdAsync("Session 2");

            var result = await _client.GetAsync("/api/my/sessions");
            var sessions = await result.Content.ReadFromJsonAsync<List<SessionListItemResponse>>();

            result.StatusCode.Should().Be(HttpStatusCode.OK);
            sessions.Should().HaveCount(2);
        }


        [Fact]
        public async Task GetInvited_ReturnsOkWithSessions()
        {
            await LoginAsync("owner");
            var sessionId = await CreateSessionAndGetIdAsync();

            await LoginAsync("invitee");

            await LoginAsync("owner");
            await _client.PostAsJsonAsync(
                $"/api/my/sessions/{sessionId}/invite",
                new InviteUserToSessionRequest("invitee")
            );

            await LoginAsync("invitee");

            var result = await _client.GetAsync("/api/my/sessions/invited");
            var sessions = await result.Content.ReadFromJsonAsync<List<SessionListItemResponse>>();

            result.StatusCode.Should().Be(HttpStatusCode.OK);
            sessions.Should().HaveCount(1);
        }


        [Fact]
        public async Task GetById_WithValidId_ReturnsOk()
        {
            await LoginAsync();
            var sessionId = await CreateSessionAndGetIdAsync();

            var result = await _client.GetAsync($"/api/my/sessions/{sessionId}");

            result.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task GetById_WithNonExistentId_ReturnsNotFound()
        {
            await LoginAsync();

            var result = await _client.GetAsync("/api/my/sessions/99999");

            result.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task GetById_OtherUsersSession_ReturnsNotFound()
        {
            await LoginAsync("user1");
            var sessionId = await CreateSessionAndGetIdAsync();

            await LoginAsync("user2");

            var result = await _client.GetAsync($"/api/my/sessions/{sessionId}");

            result.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }


        [Fact]
        public async Task Invite_WithValidUser_ReturnsNoContent()
        {
            await LoginAsync("owner");
            var sessionId = await CreateSessionAndGetIdAsync();

            await LoginAsync("invitee");
            await LoginAsync("owner");

            var result = await _client.PostAsJsonAsync(
                $"/api/my/sessions/{sessionId}/invite",
                new InviteUserToSessionRequest("invitee")
            );

            result.StatusCode.Should().Be(HttpStatusCode.NoContent);
        }

        [Fact]
        public async Task Invite_AsNonOwner_ReturnsNotFound()
        {
            await LoginAsync("owner");
            var sessionId = await CreateSessionAndGetIdAsync();

            await LoginAsync("nonowner");

            var result = await _client.PostAsJsonAsync(
                $"/api/my/sessions/{sessionId}/invite",
                new InviteUserToSessionRequest("owner")
            );

            result.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }


        [Fact]
        public async Task Respond_Accept_ReturnsNoContent()
        {
            await LoginAsync("owner");
            var sessionId = await CreateSessionAndGetIdAsync();

            await LoginAsync("invitee");
            await LoginAsync("owner");

            await _client.PostAsJsonAsync(
                $"/api/my/sessions/{sessionId}/invite",
                new InviteUserToSessionRequest("invitee")
            );

            await LoginAsync("invitee");

            var result = await _client.PostAsJsonAsync(
                $"/api/my/sessions/{sessionId}/respond",
                new RespondToInvitationRequest(Accept: true)
            );

            result.StatusCode.Should().Be(HttpStatusCode.NoContent);
        }

        [Fact]
        public async Task Respond_Decline_ReturnsNoContent()
        {
            await LoginAsync("owner");
            var sessionId = await CreateSessionAndGetIdAsync();

            await LoginAsync("invitee");
            await LoginAsync("owner");

            await _client.PostAsJsonAsync(
                $"/api/my/sessions/{sessionId}/invite",
                new InviteUserToSessionRequest("invitee")
            );

            await LoginAsync("invitee");

            var result = await _client.PostAsJsonAsync(
                $"/api/my/sessions/{sessionId}/respond",
                new RespondToInvitationRequest(Accept: false)
            );

            result.StatusCode.Should().Be(HttpStatusCode.NoContent);
        }


        [Fact]
        public async Task GetParticipants_ReturnsOk()
        {
            await LoginAsync();
            var sessionId = await CreateSessionAndGetIdAsync();

            var result = await _client.GetAsync($"/api/my/sessions/{sessionId}/participants");

            result.StatusCode.Should().Be(HttpStatusCode.OK);
        }


        [Fact]
        public async Task RemoveParticipant_AsOwner_ReturnsOk()
        {
            await LoginAsync("owner");
            var sessionId = await CreateSessionAndGetIdAsync();

            await LoginAsync("invitee");
            var inviteeId = await GetCurrentUserIdAsync("invitee");

            await LoginAsync("owner");
            await _client.PostAsJsonAsync(
                $"/api/my/sessions/{sessionId}/invite",
                new InviteUserToSessionRequest("invitee")
            );

            var result = await _client.DeleteAsync(
                $"/api/my/sessions/{sessionId}/participants/{inviteeId}"
            );

            result.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task RemoveParticipant_AsNonOwner_ReturnsForbidden()
        {
            await LoginAsync("owner");
            var sessionId = await CreateSessionAndGetIdAsync();

            await LoginAsync("invitee");
            var inviteeId = await GetCurrentUserIdAsync("invitee");

            await LoginAsync("owner");
            await _client.PostAsJsonAsync(
                $"/api/my/sessions/{sessionId}/invite",
                new InviteUserToSessionRequest("invitee")
            );

            await LoginAsync("invitee");

            var result = await _client.DeleteAsync(
                $"/api/my/sessions/{sessionId}/participants/{inviteeId}"
            );

            result.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        }


        [Fact]
        public async Task Delete_AsOwner_ReturnsNoContent()
        {
            await LoginAsync();
            var sessionId = await CreateSessionAndGetIdAsync();

            var result = await _client.DeleteAsync($"/api/my/sessions/{sessionId}");

            result.StatusCode.Should().Be(HttpStatusCode.NoContent);
        }

        [Fact]
        public async Task Delete_AsNonOwner_ReturnsNotFound()
        {
            await LoginAsync("owner");
            var sessionId = await CreateSessionAndGetIdAsync();

            await LoginAsync("nonowner");

            var result = await _client.DeleteAsync($"/api/my/sessions/{sessionId}");

            result.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task Delete_WithNonExistentId_ReturnsNotFound()
        {
            await LoginAsync();

            var result = await _client.DeleteAsync("/api/my/sessions/99999");

            result.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }


        [Fact]
        public async Task GetGamePool_ReturnsOk()
        {
            await LoginAsync();
            var sessionId = await CreateSessionAndGetIdAsync();

            var result = await _client.GetAsync($"/api/my/sessions/{sessionId}/game-pool");

            result.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task ToggleGameVote_ReturnsNoContent()
        {
            await LoginAsync();
            var sessionId = await CreateSessionAndGetIdAsync();

            var result = await _client.PostAsJsonAsync(
                $"/api/my/sessions/{sessionId}/game-pool/votes",
                new ToggleGameVoteRequest("catan")
            );

            result.StatusCode.Should().Be(HttpStatusCode.NoContent);
        }


        private async Task<int> GetCurrentUserIdAsync(string username)
        {
            using var scope = _factory.Services.CreateScope();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
            var user = await userManager.FindByNameAsync(username);
            return user!.Id;
        }
    }
}
