using kiedygramy.Controllers.Base;
using kiedygramy.Domain;
using kiedygramy.DTO.Auth;
using kiedygramy.Services.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace kiedygramy.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ApiControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly IAuthService _authService;

        public AuthController( UserManager<User> userManager, SignInManager<User> signInManager, IAuthService authService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _authService = authService;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if(!ModelState.IsValid)
                return ValidationProblemFromModelState();

            var (user, error) = await _authService.RegisterAsync(dto);

            if (error is not null)
                return Problem(error);

            return Ok(user); 
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
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

            var meDto = new MeDto(
                user.Id,
                user.UserName!,
                user.Email,
                user.FullName,
                user.City);

            return Ok(meDto);
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return NoContent();
        }
    }
}
