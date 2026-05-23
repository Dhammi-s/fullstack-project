using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using fullstack_project.Server.Data;
using fullstack_project.Server.DTOs;
using System.Security.Claims;

namespace fullstack_project.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public DashboardController(ApplicationDbContext db) => _db = db;

        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AdminDashboard()
        {
            var totalUsers = await _db.Users.CountAsync();
            var workerRoleId = (await _db.Roles.FirstOrDefaultAsync(r => r.Name == "Worker"))?.Id;
            var customerRoleId = (await _db.Roles.FirstOrDefaultAsync(r => r.Name == "Customer"))?.Id;

            var totalWorkers = workerRoleId != null ? await _db.UserRoles.CountAsync(r => r.RoleId == workerRoleId) : 0;
            var totalCustomers = customerRoleId != null ? await _db.UserRoles.CountAsync(r => r.RoleId == customerRoleId) : 0;

            var orders = await _db.Orders.Include(o => o.Customer).ToListAsync();
            var revenue = orders.Where(o => o.PaymentStatus == "Paid").Sum(o => o.TotalAmount);

            var recentOrders = orders.OrderByDescending(o => o.CreatedAt).Take(10).Select(o => new RecentOrderDto
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                Status = o.Status,
                TotalAmount = o.TotalAmount,
                CreatedAt = o.CreatedAt,
                CustomerName = o.Customer?.FullName ?? ""
            }).ToList();

            return Ok(new AdminDashboardDto
            {
                TotalUsers = totalUsers,
                TotalWorkers = totalWorkers,
                TotalCustomers = totalCustomers,
                TotalOrders = orders.Count,
                PendingOrders = orders.Count(o => o.Status == "Pending"),
                CompletedOrders = orders.Count(o => o.Status == "Completed"),
                TotalRevenue = revenue,
                TotalProducts = await _db.Products.CountAsync(),
                TotalServices = await _db.Services.CountAsync(),
                TotalCategories = await _db.Categories.CountAsync(),
                RecentOrders = recentOrders
            });
        }

        [HttpGet("worker")]
        [Authorize(Roles = "Worker")]
        public async Task<IActionResult> WorkerDashboard()
        {
            var workerId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var orders = await _db.Orders.Include(o => o.Customer).Where(o => o.WorkerId == workerId).ToListAsync();
            var earnings = orders.Where(o => o.PaymentStatus == "Paid").Sum(o => o.TotalAmount);
            var worker = await _db.Users.FindAsync(workerId);

            return Ok(new WorkerDashboardDto
            {
                TotalOrders = orders.Count,
                PendingOrders = orders.Count(o => o.Status == "Pending"),
                CompletedOrders = orders.Count(o => o.Status == "Completed"),
                TotalEarnings = earnings,
                AverageRating = worker?.Rating ?? 0,
                TotalReviews = worker?.TotalReviews ?? 0,
                TotalServices = await _db.Services.CountAsync(s => s.WorkerId == workerId),
                RecentOrders = orders.OrderByDescending(o => o.CreatedAt).Take(5).Select(o => new RecentOrderDto
                {
                    Id = o.Id,
                    OrderNumber = o.OrderNumber,
                    Status = o.Status,
                    TotalAmount = o.TotalAmount,
                    CreatedAt = o.CreatedAt,
                    CustomerName = o.Customer?.FullName ?? ""
                }).ToList()
            });
        }

        [HttpGet("customer")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> CustomerDashboard()
        {
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var orders = await _db.Orders.Where(o => o.CustomerId == customerId).ToListAsync();
            var spent = orders.Where(o => o.PaymentStatus == "Paid").Sum(o => o.TotalAmount);

            return Ok(new CustomerDashboardDto
            {
                TotalOrders = orders.Count,
                PendingOrders = orders.Count(o => o.Status == "Pending"),
                CompletedOrders = orders.Count(o => o.Status == "Completed"),
                TotalSpent = spent,
                RecentOrders = orders.OrderByDescending(o => o.CreatedAt).Take(5).Select(o => new RecentOrderDto
                {
                    Id = o.Id,
                    OrderNumber = o.OrderNumber,
                    Status = o.Status,
                    TotalAmount = o.TotalAmount,
                    CreatedAt = o.CreatedAt,
                    CustomerName = ""
                }).ToList()
            });
        }
    }
}
