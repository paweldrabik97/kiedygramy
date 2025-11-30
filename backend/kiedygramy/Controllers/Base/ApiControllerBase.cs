using Microsoft.AspNetCore.Mvc;
using kiedygramy.DTO.Common;

namespace kiedygramy.Controllers.Base
{
    public abstract class ApiControllerBase : ControllerBase
    {
        protected ErrorResponseDto CreateError(
            int status,
            string title,
            string detail,
            string? instance = null,
            IDictionary<string, string[]>? errors = null)
            { 
                return new ErrorResponseDto(
                
                    status: status,
                    title: title,
                    detail: detail,
                    instance: HttpContext.Request.Path,
                    errors: errors
                
                );
            }
        
            
        


    }
}
