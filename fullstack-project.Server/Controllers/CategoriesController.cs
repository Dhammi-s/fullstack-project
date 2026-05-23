using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using fullstack_project.Server.Data;
using fullstack_project.Server.DTOs;
using fullstack_project.Server.Models;

namespace fullstack_project.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public CategoriesController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _db.Categories
                .Include(c => c.Services)
                .Include(c => c.Products)
                .Where(c => c.IsActive)
                .ToListAsync();

            return Ok(categories.Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                Icon = c.Icon,
                ImageUrl = c.ImageUrl,
                IsActive = c.IsActive,
                ServiceCount = c.Services.Count(s => s.IsActive),
                ProductCount = c.Products.Count(p => p.IsActive)
            }));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var c = await _db.Categories
                .Include(x => x.Services)
                .Include(x => x.Products)
                .FirstOrDefaultAsync(x => x.Id == id);
            if (c == null) return NotFound();
            return Ok(new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                Icon = c.Icon,
                ImageUrl = c.ImageUrl,
                IsActive = c.IsActive,
                ServiceCount = c.Services.Count,
                ProductCount = c.Products.Count
            });
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateCategoryDto dto)
        {
            var category = new Category
            {
                Name = dto.Name,
                Description = dto.Description,
                Icon = dto.Icon,
                ImageUrl = dto.ImageUrl
            };
            _db.Categories.Add(category);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = category.Id }, category);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateCategoryDto dto)
        {
            var category = await _db.Categories.FindAsync(id);
            if (category == null) return NotFound();
            category.Name = dto.Name;
            category.Description = dto.Description;
            category.Icon = dto.Icon;
            category.ImageUrl = dto.ImageUrl;
            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var category = await _db.Categories.FindAsync(id);
            if (category == null) return NotFound();
            category.IsActive = false;
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
