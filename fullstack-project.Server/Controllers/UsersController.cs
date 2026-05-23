using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using fullstack_project.Server.Data;
using fullstack_project.Server.DTOs;
using fullstack_project.Server.Models;
using System.Security.Claims;

namespace fullstack_project.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _db;

        public UsersController(UserManager<ApplicationUser> userManager, ApplicationDbContext db)
        {
            _userManager = userManager;
            _db = db;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound();
            var roles = await _userManager.GetRolesAsync(user);
            return Ok(MapToDto(user, roles.FirstOrDefault() ?? "Customer"));
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound();

            user.FullName = dto.FullName;
            user.Phone = dto.Phone;
            user.Address = dto.Address;
            user.ProfileImage = dto.ProfileImage;
            user.Skills = dto.Skills;
            user.Bio = dto.Bio;
            user.HourlyRate = dto.HourlyRate;
            user.IsAvailable = dto.IsAvailable;

            await _userManager.UpdateAsync(user);
            var roles = await _userManager.GetRolesAsync(user);
            return Ok(MapToDto(user, roles.FirstOrDefault() ?? "Customer"));
        }

        [HttpGet("workers")]
        [AllowAnonymous]
        public async Task<IActionResult> GetWorkers([FromQuery] string? skill, [FromQuery] bool? available)
        {
            var workerRole = await _db.Roles.FirstOrDefaultAsync(r => r.Name == "Worker");
            if (workerRole == null) return Ok(new List<UserProfileDto>());

            var workerIds = await _db.UserRoles
                .Where(ur => ur.RoleId == workerRole.Id)
                .Select(ur => ur.UserId)
                .ToListAsync();

            var query = _db.Users.Where(u => workerIds.Contains(u.Id) && u.IsActive);
            if (available.HasValue) query = query.Where(u => u.IsAvailable == available.Value);
            if (!string.IsNullOrEmpty(skill)) query = query.Where(u => u.Skills != null && u.Skills.Contains(skill));

            var workers = await query.ToListAsync();
            return Ok(workers.Select(w => MapToDto(w, "Worker")));
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();
            var roles = await _userManager.GetRolesAsync(user);
            return Ok(MapToDto(user, roles.FirstOrDefault() ?? "Customer"));
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _db.Users.ToListAsync();
            var result = new List<UserProfileDto>();
            foreach (var u in users)
            {
                var roles = await _userManager.GetRolesAsync(u);
                result.Add(MapToDto(u, roles.FirstOrDefault() ?? "Customer"));
            }
            return Ok(result);
        }

        [HttpPut("{id}/toggle-status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ToggleStatus(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();
            user.IsActive = !user.IsActive;
            await _userManager.UpdateAsync(user);
            return Ok(new { isActive = user.IsActive });
        }

        private static UserProfileDto MapToDto(ApplicationUser u, string role) => new()
        {
            Id = u.Id,
            FullName = u.FullName,
            Email = u.Email ?? "",
            Phone = u.Phone,
            Address = u.Address,
            ProfileImage = u.ProfileImage,
            Skills = u.Skills,
            Bio = u.Bio,
            HourlyRate = u.HourlyRate,
            Rating = u.Rating,
            TotalReviews = u.TotalReviews,
            IsAvailable = u.IsAvailable,
            IsActive = u.IsActive,
            CreatedAt = u.CreatedAt,
            Role = role
        };
    }
}
