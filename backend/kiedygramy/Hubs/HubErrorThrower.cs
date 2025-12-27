using kiedygramy.DTO.Common;
using Microsoft.AspNetCore.SignalR;
using System.Text.Json;


namespace kiedygramy.Hubs
{
    public class HubErrorThrower
    {
            private static readonly JsonSerializerOptions Options = new()
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };

            public static void Throw(ErrorResponseDto error)
            {
                throw new HubException(JsonSerializer.Serialize(error, Options));
            }        
    }
}
