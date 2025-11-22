using kiedygramy.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using kiedygramy.Domain;
using Microsoft.EntityFrameworkCore;
using kiedygramy.DTO.Session;

namespace kiedygramy.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/my/sessions")]
    public class MySessionsController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly UserManager<User> _userManager;

        public MySessionsController(AppDbContext db, UserManager<User> userManager)
        {
            _db = db;
            _userManager = userManager;
        }

        [HttpPost]
        public async Task<ActionResult<SessionDetailsDto>> Create([FromBody] CreateSessionDto dto)
        { 
            var me = await _userManager.GetUserAsync(User);
           
            if(me is null)
                return Unauthorized();

            if (string.IsNullOrWhiteSpace(dto.Title))
                return BadRequest("Title is required.");

            var session = new Session
            {
                Title = dto.Title.Trim(),
                Date = dto.Date,
                Location = dto.Location?.Trim(),
                Description = dto.Description?.Trim(),
                OwnerId = me.Id,
                GameId = dto.GameId
            };

            var ownerParticipant = new SessionParticipant
            {
               Session = session,
                UserId = me.Id,
                Role = "Host",
                Status = "Confirmed"
            };

            _db.Sessions.Add(session);
            _db.SessionParticipants.Add(ownerParticipant);

            await _db.SaveChangesAsync();

           var details = new SessionDetailsDto(
                Id: session.Id,
                Title: session.Title,
                Date: session.Date,
                Location: session.Location,
                Description: session.Description,
                OwnerId: session.OwnerId,
                OwnerUserName: me.UserName!,
                GameId: session.GameId == 0 ? null : session.GameId,
                GameTitle: null
                );


            return CreatedAtAction(nameof(GetById), new { id = session.Id }, details);

        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<SessionDetailsDto>> GetById(int id)
        {
            var me = await _userManager.GetUserAsync(User);
            if (me is null)
                return Unauthorized();

            var session = await _db.Sessions
                .Include(s => s.Owner)
                .Include(s => s.Game)
                .FirstOrDefaultAsync(s => s.Id == id && s.OwnerId == me.Id);

            if (session is null)
                return NotFound();

            var details = new SessionDetailsDto(
                Id: session.Id,
                Title: session.Title,
                Date: session.Date,
                Location: session.Location,
                Description: session.Description,
                OwnerId: session.OwnerId,
                OwnerUserName: session.Owner.UserName!,
                GameId: session.GameId == 0 ? null : session.GameId,
                GameTitle: session.Game?.Title
                );
            return Ok(details);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SessionListItemDto>>> GetMine()
        { 
            var me = await _userManager.GetUserAsync(User);
            
            if (me is null)
                return Unauthorized();

            var list = await _db.Sessions
                .Where(s => s.OwnerId == me.Id)
                .OrderByDescending(s => s.Date ?? DateTime.MaxValue)
                .Select(s => new SessionListItemDto(
                
                    s.Id,
                    s.Title,
                    s.Date,
                    s.Location,
                    s.Participants.Count(p => p.Status == "Confirmed")
                ))
                .ToListAsync();

            return Ok(list);
        }

    }
}
