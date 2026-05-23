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
    public class CartController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public CartController(ApplicationDbContext db) => _db = db;

        private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            var cart = await _db.Carts
                .Include(c => c.CartItems).ThenInclude(i => i.Product)
                .Include(c => c.CartItems).ThenInclude(i => i.Service)
                .FirstOrDefaultAsync(c => c.UserId == UserId);

            if (cart == null) return Ok(new CartResponseDto { Items = new(), Total = 0 });

            var items = cart.CartItems.Select(i => new CartItemResponseDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ServiceId = i.ServiceId,
                Name = i.Product?.Name ?? i.Service?.Title ?? "",
                ImageUrl = i.Product?.ImageUrl ?? i.Service?.ImageUrl ?? "",
                Price = i.Product?.Price ?? i.Service?.Price ?? 0,
                Quantity = i.Quantity,
                Total = (i.Product?.Price ?? i.Service?.Price ?? 0) * i.Quantity
            }).ToList();

            return Ok(new CartResponseDto
            {
                Id = cart.Id,
                Items = items,
                Total = items.Sum(i => i.Total)
            });
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartDto dto)
        {
            var cart = await _db.Carts.Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.UserId == UserId);

            if (cart == null)
            {
                cart = new Cart { UserId = UserId };
                _db.Carts.Add(cart);
                await _db.SaveChangesAsync();
            }

            var existing = cart.CartItems.FirstOrDefault(i =>
                (dto.ProductId.HasValue && i.ProductId == dto.ProductId) ||
                (dto.ServiceId.HasValue && i.ServiceId == dto.ServiceId));

            if (existing != null)
            {
                existing.Quantity += dto.Quantity;
            }
            else
            {
                cart.CartItems.Add(new CartItem
                {
                    CartId = cart.Id,
                    ProductId = dto.ProductId,
                    ServiceId = dto.ServiceId,
                    Quantity = dto.Quantity
                });
            }

            await _db.SaveChangesAsync();
            return Ok(new { message = "Added to cart" });
        }

        [HttpDelete("remove/{itemId}")]
        public async Task<IActionResult> RemoveItem(int itemId)
        {
            var item = await _db.CartItems
                .Include(i => i.Cart)
                .FirstOrDefaultAsync(i => i.Id == itemId && i.Cart!.UserId == UserId);
            if (item == null) return NotFound();
            _db.CartItems.Remove(item);
            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart()
        {
            var cart = await _db.Carts.Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.UserId == UserId);
            if (cart == null) return Ok();
            _db.CartItems.RemoveRange(cart.CartItems);
            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpPut("update/{itemId}")]
        public async Task<IActionResult> UpdateQuantity(int itemId, [FromBody] int quantity)
        {
            var item = await _db.CartItems
                .Include(i => i.Cart)
                .FirstOrDefaultAsync(i => i.Id == itemId && i.Cart!.UserId == UserId);
            if (item == null) return NotFound();
            if (quantity <= 0) { _db.CartItems.Remove(item); }
            else { item.Quantity = quantity; }
            await _db.SaveChangesAsync();
            return Ok();
        }
    }
}
