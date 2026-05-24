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
    public class OrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public OrdersController(ApplicationDbContext db) => _db = db;

        [HttpGet]
        public async Task<IActionResult> GetOrders()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var role = User.FindFirstValue(ClaimTypes.Role);

            IQueryable<Order> query = _db.Orders
                .Include(o => o.Customer)
                .Include(o => o.Worker)
                .Include(o => o.Service)
                .Include(o => o.OrderItems).ThenInclude(i => i.Product);

            if (role == "Customer") query = query.Where(o => o.CustomerId == userId);
            else if (role == "Worker") query = query.Where(o => o.WorkerId == userId);

            var orders = await query.OrderByDescending(o => o.CreatedAt).ToListAsync();
            return Ok(orders.Select(MapToDto));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrder(int id)
        {
            var order = await _db.Orders
                .Include(o => o.Customer)
                .Include(o => o.Worker)
                .Include(o => o.Service)
                .Include(o => o.OrderItems).ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(o => o.Id == id);
            if (order == null) return NotFound();
            return Ok(MapToDto(order));
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

            decimal total = 0;
            if (dto.OrderType == "Service" && dto.ServiceId.HasValue)
            {
                var service = await _db.Services.FindAsync(dto.ServiceId.Value);
                if (service == null) return BadRequest("Service not found");
                total = service.Price;
            }
            else
            {
                foreach (var item in dto.Items)
                {
                    total += item.UnitPrice * item.Quantity;
                }
            }

            var order = new Order
            {
                OrderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}",
                Status = "Pending",
                TotalAmount = total,
                PaymentStatus = dto.PaymentMethod == "COD" ? "Pending" : "Pending",
                PaymentMethod = dto.PaymentMethod ?? "Online",
                OrderType = dto.OrderType,
                Notes = dto.Notes,
                Address = dto.Address,
                ScheduledAt = dto.ScheduledAt,
                CustomerId = userId,
                WorkerId = dto.WorkerId,
                ServiceId = dto.ServiceId
            };

            foreach (var item in dto.Items)
            {
                order.OrderItems.Add(new OrderItem
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    TotalPrice = item.UnitPrice * item.Quantity
                });
            }

            _db.Orders.Add(order);
            await _db.SaveChangesAsync();

            // Add notification
            _db.Notifications.Add(new Notification
            {
                UserId = userId,
                Title = "Order Created",
                Message = $"Your order {order.OrderNumber} has been placed.",
                Type = "Success",
                Link = $"/orders/{order.Id}"
            });
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, MapToDto(order));
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Worker,Admin")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
        {
            var order = await _db.Orders.Include(o => o.Customer).FirstOrDefaultAsync(o => o.Id == id);
            if (order == null) return NotFound();

            order.Status = status;
            order.UpdatedAt = DateTime.UtcNow;
            if (status == "Completed") order.CompletedAt = DateTime.UtcNow;

            _db.Notifications.Add(new Notification
            {
                UserId = order.CustomerId,
                Title = "Order Updated",
                Message = $"Your order {order.OrderNumber} status changed to {status}.",
                Type = "Info",
                Link = $"/orders/{order.Id}"
            });

            await _db.SaveChangesAsync();
            return Ok(new { status });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelOrder(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id && o.CustomerId == userId);
            if (order == null) return NotFound();
            if (order.Status != "Pending") return BadRequest("Only pending orders can be cancelled");

            order.Status = "Cancelled";
            order.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpPut("{id}/assign-worker")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AssignWorker(int id, [FromBody] AssignWorkerDto dto)
        {
            var order = await _db.Orders.Include(o => o.Customer).FirstOrDefaultAsync(o => o.Id == id);
            if (order == null) return NotFound();
            order.WorkerId = dto.WorkerId;
            order.Status = "Confirmed";
            order.UpdatedAt = DateTime.UtcNow;

            // Notify worker
            _db.Notifications.Add(new Notification
            {
                UserId = dto.WorkerId,
                Title = "New Assignment",
                Message = $"You have been assigned to order {order.OrderNumber}.",
                Type = "Info",
                Link = $"/worker/assignments"
            });
            // Notify customer
            _db.Notifications.Add(new Notification
            {
                UserId = order.CustomerId,
                Title = "Worker Assigned",
                Message = $"A worker has been assigned to your order {order.OrderNumber}.",
                Type = "Success",
                Link = $"/orders/{order.Id}"
            });
            await _db.SaveChangesAsync();
            return Ok(new { message = "Worker assigned" });
        }

        [HttpGet("scheduled")]
        [Authorize(Roles = "Worker,Admin")]
        public async Task<IActionResult> GetScheduled()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var role = User.FindFirstValue(ClaimTypes.Role);

            IQueryable<Order> query = _db.Orders
                .Include(o => o.Customer)
                .Include(o => o.Service)
                .Where(o => o.ScheduledAt != null);

            if (role == "Worker") query = query.Where(o => o.WorkerId == userId);

            var orders = await query.OrderBy(o => o.ScheduledAt).ToListAsync();
            return Ok(orders.Select(o => new ScheduledOrderDto
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                CustomerName = o.Customer?.FullName ?? "",
                ServiceTitle = o.Service?.Title,
                Address = o.Address,
                ScheduledAt = o.ScheduledAt,
                Status = o.Status,
                TotalAmount = o.TotalAmount,
                PaymentMethod = o.PaymentMethod
            }));
        }

        private static OrderResponseDto MapToDto(Order o) => new()
        {
            Id = o.Id,
            OrderNumber = o.OrderNumber,
            Status = o.Status,
            TotalAmount = o.TotalAmount,
            PaymentStatus = o.PaymentStatus,
            OrderType = o.OrderType,
            PaymentMethod = o.PaymentMethod,
            Notes = o.Notes,
            Address = o.Address,
            CreatedAt = o.CreatedAt,
            ScheduledAt = o.ScheduledAt,
            CompletedAt = o.CompletedAt,
            CustomerId = o.CustomerId,
            CustomerName = o.Customer?.FullName ?? "",
            WorkerId = o.WorkerId,
            WorkerName = o.Worker?.FullName,
            ServiceTitle = o.Service?.Title,
            Items = o.OrderItems.Select(i => new OrderItemResponseDto
            {
                Id = i.Id,
                ProductName = i.Product?.Name ?? "",
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                TotalPrice = i.TotalPrice
            }).ToList()
        };
    }
}
