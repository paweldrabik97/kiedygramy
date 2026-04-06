using kiedygramy.Controllers.Base;
using kiedygramy.Domain;
using kiedygramy.DTO.Auth;
using kiedygramy.Services.Account;
using kiedygramy.Services.Auth;
using kiedygramy.Services.Email;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Configuration;
using static kiedygramy.Infrastructure.RateLimitingExtensions;
using Google.Apis.Auth;
using System.Net.Http.Headers;
using System.Text.Json;

namespace kiedygramy.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ApiControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly IAuthService _authService;
        private readonly IAccountService _accountService;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;

        public AuthController(UserManager<User> userManager, SignInManager<User> signInManager, IAccountService accountService, IAuthService authService, IConfiguration configuration)
        public AuthController(UserManager<User> userManager, SignInManager<User> signInManager, IAccountService accountService, IAuthService authService, IEmailService emailService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _accountService = accountService;
            _authService = authService;
            _emailService = emailService;
            _configuration = configuration;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        [EnableRateLimiting(RateLimitPolicies.Auth)]
        public async Task<IActionResult> Register([FromBody] RegisterRequest dto)
        {
            if (!ModelState.IsValid)
                return ValidationProblemFromModelState();

            var (user, error) = await _authService.RegisterAsync(dto);

            if (error is not null)
                return Problem(error);

            return Ok(user);
        }
        
        [HttpPost("confirmation-email")]
        [AllowAnonymous]
        public async Task<IActionResult> ConfirmationEmail([FromQuery] string email, [FromQuery] string token)
        {
            if(!ModelState.IsValid)
                return ValidationProblemFromModelState();

            var error = await _authService.ConfirmEmailAsync(email, token);

            if (error is not null)
                return Problem(error);

            return NoContent();
        }

        [HttpPost("resend-confirmation-email")]
        [AllowAnonymous]
        public async Task<IActionResult> ResendConfirationEmail([FromQuery] string email)
        {
            if (!ModelState.IsValid)
                return ValidationProblemFromModelState();

            var error = await _authService.ResendConfiramtionEmailAsync(email);

            if(error is not null)
                return Problem(error);

            return NoContent();
        }

        [HttpPost("login")]
        [AllowAnonymous]
        [EnableRateLimiting(RateLimitPolicies.Auth)]
        public async Task<IActionResult> Login([FromBody] LoginRequest dto)
        {
            if (!ModelState.IsValid)
                return ValidationProblemFromModelState();

            var error = await _authService.LoginAsync(dto);

            if (error is not null)
                return Problem(error);

            return NoContent();
        }

        [HttpPost("google")]
        [AllowAnonymous]
        [EnableRateLimiting(RateLimitPolicies.Auth)]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
        {
            try
            {
                var settings = new GoogleJsonWebSignature.ValidationSettings()
                {
                    Audience = new List<string>() { _configuration["Google:ClientId"] }
                };

                var payload = await GoogleJsonWebSignature.ValidateAsync(request.Credential, settings);

                var user = await _userManager.FindByEmailAsync(payload.Email);

                if (user is null)
                {
                    user = new User
                    {
                        Email = payload.Email,
                        UserName = payload.Email,
                        FullName = payload.Name,
                        PreferredLanguage = "en"
                    };
                    var result = await _userManager.CreateAsync(user);
                    if (!result.Succeeded)
                        return Problem("Failed to create user.");
                }

                await _signInManager.SignInAsync(user, isPersistent: false);

                return Ok(user);
            }
            catch (InvalidJwtException)
            {
                return Problem("Invalid Google token.");
            }
            catch (UnauthorizedAccessException)
            {
                return Problem("Google authentication failed.");
            }
            catch (Exception ex)
            {
                return Problem("An error occurred during Google authentication.");
            }
        }

        [HttpPost("discord")]
        [AllowAnonymous]
        [EnableRateLimiting(RateLimitPolicies.Auth)]
        public async Task<IActionResult> DiscordLogin([FromBody] DiscordLoginRequest request)
        {
            try
            {
                using var httpClient = new HttpClient();

                // --- 1. EXCHANGE CODE FOR TOKEN ---
                var tokenParams = new Dictionary<string, string>
                {
                    { "client_id", _configuration["Discord:ClientId"]! },
                    { "client_secret", _configuration["Discord:ClientSecret"]! },
                    { "grant_type", "authorization_code" },
                    { "code", request.Code },
                    { "redirect_uri", _configuration["Discord:RedirectUri"]! }
                };

                var tokenResponse = await httpClient.PostAsync("https://discord.com/api/oauth2/token", new FormUrlEncodedContent(tokenParams));

                if (!tokenResponse.IsSuccessStatusCode)
                    return Problem("Failed to verify Discord login.");

                var tokenData = await tokenResponse.Content.ReadFromJsonAsync<JsonElement>();
                var accessToken = tokenData.GetProperty("access_token").GetString();

                // --- 2. FETCH USER DATA ---
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
                var userResponse = await httpClient.GetAsync("https://discord.com/api/users/@me");

                if (!userResponse.IsSuccessStatusCode)
                    return Problem("Failed to fetch Discord profile.");

                var userData = await userResponse.Content.ReadFromJsonAsync<JsonElement>();
                var email = userData.GetProperty("email").GetString();
                var discordUsername = userData.GetProperty("username").GetString();

                // global_name is the display name (may be null, fallback to username)
                var fullName = userData.TryGetProperty("global_name", out var gn) && gn.ValueKind != JsonValueKind.Null ? gn.GetString() : discordUsername;

                if (string.IsNullOrEmpty(email))
                    return Problem("No email address associated with Discord account.");

                // --- 3. REGISTER / LOGIN (Same as Google) ---
                var user = await _userManager.FindByEmailAsync(email);
                var currentLang = !string.IsNullOrWhiteSpace(request.Language) ? request.Language.Substring(0, 2).ToLower() : "en";

                if (user is null)
                {
                    user = new User
                    {
                        Email = email,
                        UserName = discordUsername!.Replace(" ", ""),
                        FullName = fullName,
                        PreferredLanguage = currentLang
                    };

                    var createResult = await _userManager.CreateAsync(user);
                    if (!createResult.Succeeded)
                        return Problem("Failed to create user account.");
                }
                else if (user.PreferredLanguage != currentLang)
                {
                    user.PreferredLanguage = currentLang;
                    await _userManager.UpdateAsync(user);
                }

                // --- 4. SIGN IN ---
                await _signInManager.SignInAsync(user, isPersistent: true);

                return Ok(user);
            }
            catch (Exception ex)
            {
                return Problem("An error occurred during Discord authentication.");
            }
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
            var user = await _userManager.GetUserAsync(User);

            if (user is null)
                return Unauthorized();

            var meDto = new MeResponse(
                user.Id,
                user.UserName!,
                user.Email,
                user.FullName,
                user.City,
                user.PreferredLanguage);

            return Ok(meDto);
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return NoContent();
        }

        [HttpPatch("change-password")]
        [Authorize]
        [EnableRateLimiting(RateLimitPolicies.Account)]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest dto)
        {
            if (!ModelState.IsValid)
                return ValidationProblemFromModelState();

            var user = GetRequiredUserId();

            var error = await _accountService.ChangePasswordAsync(user, dto);

            if (error is not null)
                return Problem(error);

            return NoContent();
        }

        [HttpPatch("change-username")]
        [Authorize]
        [EnableRateLimiting(RateLimitPolicies.Account)]
        public async Task<IActionResult> ChangeUsername([FromBody] ChangeUserNameRequest dto)
        {
            if (!ModelState.IsValid)
                return ValidationProblemFromModelState();

            var userId = GetRequiredUserId();

            var error = await _accountService.ChangeUserNameAsync(userId, dto);

            if (error is not null)
                return Problem(error);

            return NoContent();
        }

        [HttpPatch("change-city")]
        [Authorize]
        [EnableRateLimiting(RateLimitPolicies.Account)]
        public async Task<IActionResult> ChangeCity([FromBody] ChangeCityRequest dto)
        {
            if (!ModelState.IsValid)
                return ValidationProblemFromModelState();

            var userId = GetRequiredUserId();

            var error = await _accountService.ChangeCityAsync(userId, dto);

            if (error is not null)
                return Problem(error);

            return NoContent();
        }

        [HttpPatch("change-fullname")]
        [Authorize]
        [EnableRateLimiting(RateLimitPolicies.Account)]
        public async Task<IActionResult> ChangeFullName([FromBody] ChangeFullNameRequest dto)
        {
            if (!ModelState.IsValid)
                return ValidationProblemFromModelState();

            var userId = GetRequiredUserId();

            var error = await _accountService.ChangeFullNameAsync(userId, dto);

            if (error is not null)
                return Problem(error);

            return NoContent();
        }

        [HttpPatch("language")]
        [Authorize]
        [EnableRateLimiting(RateLimitPolicies.Account)]
        public async Task<IActionResult> ChangeLanguage([FromBody] UpdateLanguageRequest dto)
        {
            if (!ModelState.IsValid)
                return ValidationProblemFromModelState();
            var userId = GetRequiredUserId();
            var error = await _accountService.UpdateLanguageAsync(userId, dto);
            if (error is not null)
                return Problem(error);
            return NoContent();
        }
    }
}
