using kiedygramy.Data;
using Microsoft.AspNetCore.Identity;
using kiedygramy.Domain;
using kiedygramy.DTO.Common;
using kiedygramy.DTO.Auth;
using kiedygramy.Application.Errors;
using Microsoft.EntityFrameworkCore;




namespace kiedygramy.Services.Account
{
    public class AccountService : IAccountService
    {
        private readonly AppDbContext _db;
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;

        public AccountService(AppDbContext db, UserManager<User> userManager, SignInManager<User> signInManager)
        {
            _db = db;
            _userManager = userManager;
            _signInManager = signInManager;
        }

        public async Task<ErrorResponseDto?> ChangeCityAsync(int userId, ChangeCityDto dto)
        {
            var city = dto.NewCity?.Trim();

            if (string.IsNullOrWhiteSpace(city))
                return Errors.General.Validation("Miasto nie może być puste.", "City");

            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user is null)
                return Errors.General.Unauthorized();

            user.City = city;

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
                return Errors.Auth.IdentityValidation(result.Errors);
           
            await _signInManager.RefreshSignInAsync(user);

            return null;
        }

        public async Task<ErrorResponseDto?> ChangeFullNameAsync(int userId, ChangeFullNameDto dto)
        {
            var fullName = dto.NewFullName?.Trim();

            if (string.IsNullOrWhiteSpace(fullName))
                return Errors.General.Validation("Imię i nazwisko nie może być puste.", "FullName");

            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user is null)
                return Errors.General.Unauthorized();

            user.FullName = fullName;

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
                return Errors.Auth.IdentityValidation(result.Errors);

            await _signInManager.RefreshSignInAsync(user);

            return null;
        }

        public async Task<ErrorResponseDto?> ChangePasswordAsync(int userId, ChangePasswordDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CurrentPassword))
                return Errors.General.Validation("podaj obecne hasło", "CurrentPassword");

            if(string.IsNullOrWhiteSpace(dto.NewPassword))
                return Errors.General.Validation("podaj nowe hasło", "NewPassword");

            if (dto.NewPassword == dto.CurrentPassword)
                return Errors.General.Validation("Nowe hasło nie może być takie samo jak aktualne ", " NewPassword");

            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user is null)
                return Errors.General.Unauthorized();

            var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);

            if (!result.Succeeded)
                return Errors.Auth.IdentityValidation(result.Errors);

            await _signInManager.RefreshSignInAsync(user);

            return null;
        }

        public async Task<ErrorResponseDto?> ChangeUserNameAsync(int userId, ChangeUserNameDto dto)
        {

            if (string.IsNullOrWhiteSpace(dto.NewUserName))
                return Errors.General.Validation("Nazwa użytkownika nie może być pusta.", "Username");

            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user is null)
                return Errors.General.Unauthorized();
          
            var usernameTaken = await _userManager.Users.AnyAsync(u =>
                u.UserName!.ToLower() == dto.NewUserName.Trim().ToLower() && u.Id != userId
            );

            if (usernameTaken)
                return Errors.General.Validation("Ta nazwa użytkownika jest już zajęta.", "NewUsername");
      
            user.UserName = dto.NewUserName.Trim();
        
            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
              
                return Errors.Auth.IdentityValidation(result.Errors);
            }
           
            await _signInManager.RefreshSignInAsync(user);

            return null;       
        }
    }
}
