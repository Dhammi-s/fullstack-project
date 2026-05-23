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
    [Authorize]
    public class ReviewsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public ReviewsController(ApplicationDbContext db) => _db = db;

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetReviews([FromQuery] int? serviceId, [FromQuery] int? productId, [FromQuery] string? workerId)
        {
            var query = _db.Reviews.Include(r => r.User).AsQueryable();
            if (serviceId.HasValue) query = query.Where(r => r.ServiceId == serviceId);
            if (productId.HasValue) query = query.Where(r => r.ProductId == productId);
            if (!string.IsNullOrEmpty(workerId)) query = query.Where(r => r.WorkerId == workerId);

            var reviews = await query.OrderByDescending(r => r.CreatedAt).ToListAsync();
            return Ok(reviews.Select(r => new ReviewDto
            {
                Id = r.Id,
                Rating = r.Rating,
                Comment = r.Comment,
                UserName = r.User?.FullName ?? "",
                UserImage = r.User?.ProfileImage,
                CreatedAt = r.CreatedAt
            }));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateReviewDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var review = new Review
            {
                Rating = dto.Rating,
                Comment = dto.Comment,
                UserId = userId,
                ServiceId = dto.ServiceId,
                ProductId = dto.ProductId,
                OrderId = dto.OrderId,
                WorkerId = dto.WorkerId
            };
            _db.Reviews.Add(review);
            await _db.SaveChangesAsync();

            // Update service rating
            if (dto.ServiceId.HasValue)
            {
                var service = await _db.Services.FindAsync(dto.ServiceId.Value);
                if (service != null)
                {
                    var reviews = await _db.Reviews.Where(r => r.ServiceId == dto.ServiceId).ToListAsync();
                    service.Rating = reviews.Average(r => r.Rating);
                    service.TotalReviews = reviews.Count;
                    await _db.SaveChangesAsync();
                }
            }

            // Update product rating
            if (dto.ProductId.HasValue)
            {
                var product = await _db.Products.FindAsync(dto.ProductId.Value);
                if (product != null)
                {
                    var reviews = await _db.Reviews.Where(r => r.ProductId == dto.ProductId).ToListAsync();
                    product.Rating = reviews.Average(r => r.Rating);
                    product.TotalReviews = reviews.Count;
                    await _db.SaveChangesAsync();
                }
            }

            // Update worker rating
            if (!string.IsNullOrEmpty(dto.WorkerId))
            {
                var worker = await _db.Users.FindAsync(dto.WorkerId);
                if (worker != null)
                {
                    var reviews = await _db.Reviews.Where(r => r.WorkerId == dto.WorkerId).ToListAsync();
                    worker.Rating = reviews.Average(r => r.Rating);
                    worker.TotalReviews = reviews.Count;
                    await _db.SaveChangesAsync();
                }
            }

            return Ok(new { message = "Review submitted" });
        }
    }
}
