using System;

namespace kiedygramy.DTO.Session
{
    public record SetAvailabilityWindowDto(
     DateTime From,
     DateTime To,
     DateTime Deadline 
        );
    

    
}
