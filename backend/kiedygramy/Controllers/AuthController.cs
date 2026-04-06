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
using static kiedygramy.Infrastructure.RateLimitingExtensions;

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

        public AuthController(UserManager<User> userManager, SignInManager<User> signInManager, IAccountService accountService, IAuthService authService, IEmailService emailService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _accountService = accountService;
            _authService = authService;
            _emailService = emailService;
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
                user.PrefferedLanguage);

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
