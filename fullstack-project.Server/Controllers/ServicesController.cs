using Microsoft.AspNetCore.Authorization;
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
    public class ServicesController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public ServicesController(ApplicationDbContext db) => _db = db;

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int? categoryId, [FromQuery] string? search)
        {
            var query = _db.Services
                .Include(s => s.Category)
                .Include(s => s.Worker)
                .Where(s => s.IsActive);

            if (categoryId.HasValue) query = query.Where(s => s.CategoryId == categoryId.Value);
            if (!string.IsNullOrEmpty(search))
                query = query.Where(s => s.Title.Contains(search) || s.Description.Contains(search));

            var services = await query.ToListAsync();
            return Ok(services.Select(MapToDto));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var s = await _db.Services.Include(x => x.Category).Include(x => x.Worker).FirstOrDefaultAsync(x => x.Id == id);
            if (s == null) return NotFound();
            return Ok(MapToDto(s));
        }

        [HttpPost]
        [Authorize(Roles = "Worker,Admin")]
        public async Task<IActionResult> Create([FromBody] CreateServiceDto dto)
        {
            var workerId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var service = new Service
            {
                Title = dto.Title,
                Description = dto.Description,
                Price = dto.Price,
                PriceType = dto.PriceType,
                ImageUrl = dto.ImageUrl,
                CategoryId = dto.CategoryId,
                WorkerId = workerId
            };
            _db.Services.Add(service);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = service.Id }, service);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Worker,Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateServiceDto dto)
        {
            var service = await _db.Services.FindAsync(id);
            if (service == null) return NotFound();
            service.Title = dto.Title;
            service.Description = dto.Description;
            service.Price = dto.Price;
            service.PriceType = dto.PriceType;
            service.ImageUrl = dto.ImageUrl;
            service.CategoryId = dto.CategoryId;
            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Worker,Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var service = await _db.Services.FindAsync(id);
            if (service == null) return NotFound();
            service.IsActive = false;
            await _db.SaveChangesAsync();
            return NoContent();
        }

        private static ServiceDto MapToDto(Service s) => new()
        {
            Id = s.Id,
            Title = s.Title,
            Description = s.Description,
            Price = s.Price,
            PriceType = s.PriceType,
            ImageUrl = s.ImageUrl,
            Rating = s.Rating,
            TotalReviews = s.TotalReviews,
            CategoryId = s.CategoryId,
            CategoryName = s.Category?.Name ?? "",
            WorkerId = s.WorkerId,
            WorkerName = s.Worker?.FullName ?? "",
            WorkerImage = s.Worker?.ProfileImage,
            IsActive = s.IsActive,
            CreatedAt = s.CreatedAt
        };
    }
}
