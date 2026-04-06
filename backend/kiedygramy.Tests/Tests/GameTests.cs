using FluentAssertions;
using kiedygramy.Data;
using kiedygramy.DTO.Game;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Net.Http.Json;
using kiedygramy.Tests.Helpers;
using Microsoft.AspNetCore.Mvc.Testing;

namespace kiedygramy.Tests.Tests
{
    public class GameTests : IClassFixture<WebAppFactory>, IAsyncLifetime
    {
        private readonly HttpClient _client;
        private readonly WebAppFactory _factory;

        private Task<HttpResponseMessage> LoginAsync(string username = "testuser")
            => TestHelpers.RegisterAndLoginAsync(_client, _factory, username);

        private async Task<int> CreateGameAndGetIdAsync(string title = "Catan")
        {
            var request = new CreateGameRequest(
                Title: title,
                GenreIds: new List<int>(),
                MinPlayers: 2,
                MaxPlayers: 6,
                ImageUrl: null,
                PlayTime: "60-90 min"
            );
            var response = await _client.PostAsJsonAsync("/api/my/games", request);
            var game = await response.Content.ReadFromJsonAsync<GameListItemResponse>();
            return game!.Id;
        }

        public GameTests(WebAppFactory factory)
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
            await db.Users.ExecuteDeleteAsync();
            await db.Games.ExecuteDeleteAsync();
        }

        public Task DisposeAsync() => Task.CompletedTask;

        

        [Fact]
        public async Task CreateGame_WithValidData_ReturnsCreated()
        {
            await LoginAsync();

            var request = new CreateGameRequest(
                Title: "Catan",
                GenreIds: new List<int>(),
                MinPlayers: 3,
                MaxPlayers: 6,
                ImageUrl: null,
                PlayTime: "60-120 min"
            );

            var result = await _client.PostAsJsonAsync("/api/my/games", request);

            result.StatusCode.Should().Be(HttpStatusCode.Created);
        }

        [Fact]
        public async Task CreateGame_WhenUnauthenticated_ReturnsUnauthorized()
        {
            var request = new CreateGameRequest(
                Title: "Catan",
                GenreIds: new List<int>(),
                MinPlayers: 2,
                MaxPlayers: 6,
                ImageUrl: null,
                PlayTime: null
            );

            var result = await _client.PostAsJsonAsync("/api/my/games", request);

            result.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task CreateGame_WithEmptyTitle_ReturnsBadRequest()
        {
            await LoginAsync();

            var request = new CreateGameRequest(
                Title: "",
                GenreIds: new List<int>(),
                MinPlayers: 2,
                MaxPlayers: 6,
                ImageUrl: null,
                PlayTime: null
            );

            var result = await _client.PostAsJsonAsync("/api/my/games", request);

            result.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }
       

        [Fact]
        public async Task GetAll_ReturnsOkWithGames()
        {
            await LoginAsync();
            await CreateGameAndGetIdAsync("Catan");
            await CreateGameAndGetIdAsync("Pandemic");

            var result = await _client.GetAsync("/api/my/games");
            var games = await result.Content.ReadFromJsonAsync<List<GameListItemResponse>>();

            result.StatusCode.Should().Be(HttpStatusCode.OK);
            games.Should().HaveCount(2);
        }

        [Fact]
        public async Task GetAll_WhenUnauthenticated_ReturnsUnauthorized()
        {
            var result = await _client.GetAsync("/api/my/games");

            result.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }


        [Fact]
        public async Task GetById_WithValidId_ReturnsOk()
        {
            await LoginAsync();
            var gameId = await CreateGameAndGetIdAsync();

            var result = await _client.GetAsync($"/api/my/games/{gameId}");

            result.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task GetById_WithNonExistentId_ReturnsNotFound()
        {
            await LoginAsync();

            var result = await _client.GetAsync("/api/my/games/99999");

            result.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task GetById_WhenUnauthenticated_ReturnsUnauthorized()
        {
            var result = await _client.GetAsync("/api/my/games/1");

            result.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task GetById_OtherUsersGame_ReturnsNotFound()
        {
            await LoginAsync("user1");
            var gameId = await CreateGameAndGetIdAsync();

            await LoginAsync("user2");

            var result = await _client.GetAsync($"/api/my/games/{gameId}");

            result.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }


        [Fact]
        public async Task Update_WithValidData_ReturnsNoContent()
        {
            await LoginAsync();
            var gameId = await CreateGameAndGetIdAsync();

            var dto = new UpdateGameRequest { Title = "Catan Updated" };

            var result = await _client.PutAsJsonAsync($"/api/my/games/{gameId}", dto);

            result.StatusCode.Should().Be(HttpStatusCode.NoContent);
        }

        [Fact]
        public async Task Update_WithNonExistentId_ReturnsNotFound()
        {
            await LoginAsync();

            var dto = new UpdateGameRequest { Title = "Cokolwiek" };

            var result = await _client.PutAsJsonAsync("/api/my/games/99999", dto);

            result.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task Update_WhenUnauthenticated_ReturnsUnauthorized()
        {
            var dto = new UpdateGameRequest { Title = "Cokolwiek" };

            var result = await _client.PutAsJsonAsync("/api/my/games/1", dto);

            result.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }


        [Fact]
        public async Task Delete_WithValidId_ReturnsNoContent()
        {
            await LoginAsync();
            var gameId = await CreateGameAndGetIdAsync();

            var result = await _client.DeleteAsync($"/api/my/games/{gameId}");

            result.StatusCode.Should().Be(HttpStatusCode.NoContent);
        }

        [Fact]
        public async Task Delete_WithNonExistentId_ReturnsNotFound()
        {
            await LoginAsync();

            var result = await _client.DeleteAsync("/api/my/games/99999");

            result.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task Delete_WhenUnauthenticated_ReturnsUnauthorized()
        {
            var result = await _client.DeleteAsync("/api/my/games/1");

            result.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task Delete_OtherUsersGame_ReturnsNotFound()
        {
            await LoginAsync("user1");
            var gameId = await CreateGameAndGetIdAsync();

            await LoginAsync("user2");

            var result = await _client.DeleteAsync($"/api/my/games/{gameId}");

            result.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }
    }
}
