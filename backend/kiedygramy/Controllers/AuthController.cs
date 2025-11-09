using kiedygramy.Domain;
using kiedygramy.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace kiedygramy.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        public AuthController(UserManager<User> userManager, SignInManager<User> signInManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
        }
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            var user = new User
            {
                UserName = dto.Username,
                Email = dto.Email,
                FullName = dto.FullName,
                City = dto.City
            };
            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }
            return Ok(new { user.Id, user.UserName, user.Email});
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _userManager.FindByNameAsync(dto.UsernameOrEmail) 
                       ?? await _userManager.FindByEmailAsync(dto.UsernameOrEmail);
            
            if (user == null)
            {
                return Unauthorized("Nieprawidłowy login lub hasło");
            }

            var result = await _signInManager.PasswordSignInAsync(user,
                dto.Password,
                isPersistent: true,
                lockoutOnFailure: true);

            if (!result.Succeeded)
            {
                return Unauthorized("Nieprawidłowy login lub hasło");
            }
            return NoContent();
        }
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
           
            var user = await _userManager.GetUserAsync(User);

            if (user is null)
            return Unauthorized();
            
            var meDto = new MeDto(user.Id, user.UserName, user.Email, user.FullName, user.City);
            return Ok(meDto);
        }
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return NoContent();
        }
    }
}
