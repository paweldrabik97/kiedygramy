using kiedygramy.Application.Errors;
using kiedygramy.DTO.Common;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace kiedygramy.Controllers.Base
{
    public abstract class ApiControllerBase : ControllerBase
    {
        protected IActionResult Problem(ErrorResponseDto error)
        {
            var instance = string.IsNullOrEmpty(error.instance)
                ? HttpContext.Request.Path.Value
                : error.instance;

            var withInstance = error with { instance = instance };

            return StatusCode(withInstance.status, withInstance);
        }

        protected IActionResult ValidationProblemFromModelState()
        {
            var errors = ModelState
                .Where(ms => ms.Value?.Errors.Count > 0)
                .ToDictionary(
                    kvp => kvp.Key,
                    kvp => kvp.Value!.Errors
                        .Select(e => string.IsNullOrWhiteSpace(e.ErrorMessage)
                            ? "Nieprawidłowa wartość."
                            : e.ErrorMessage)
                        .ToArray()
                );

            var error = new ErrorResponseDto(
                status: 400,
                title: "Validation Failed",
                detail: "Jedno lub więcej pól zawiera nieprawidłowe dane.",
                instance: HttpContext.Request.Path.Value,
                errors: errors
            );

            return Problem(error);
        }

        protected int GetRequiredUserId()
        {
            var idValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!int.TryParse(idValue, out var userId))
            {                
                throw new InvalidOperationException("Brak zalogowanego użytkownika lub nieprawidłowy identyfikator użytkownika.");
            }

            return userId;
        }
    }
}
