using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using fullstack_project.Server.Data;

namespace fullstack_project.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class LogsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public LogsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET api/logs/audit?table=Orders&page=1&pageSize=50
        [HttpGet("audit")]
        public async Task<IActionResult> GetAuditLogs(
            [FromQuery] string? table,
            [FromQuery] string? action,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            var query = _context.AuditLogs.AsQueryable();
            if (!string.IsNullOrEmpty(table))
                query = query.Where(l => l.TableName == table);
            if (!string.IsNullOrEmpty(action))
                query = query.Where(l => l.Action == action);

            var total = await query.CountAsync();
            var logs = await query
                .OrderByDescending(l => l.ChangedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(l => new
                {
                    l.Id, l.TableName, l.Action, l.RecordId,
                    l.OldValues, l.NewValues, l.ChangedBy, l.ChangedAt
                })
                .ToListAsync();

            return Ok(new { total, page, pageSize, logs });
        }

        // GET api/logs/api?method=POST&page=1&pageSize=50
        [HttpGet("api")]
        public async Task<IActionResult> GetApiLogs(
            [FromQuery] string? method,
            [FromQuery] string? path,
            [FromQuery] int? statusCode,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            var query = _context.ApiRequestLogs.AsQueryable();
            if (!string.IsNullOrEmpty(method))
                query = query.Where(l => l.Method == method.ToUpper());
            if (!string.IsNullOrEmpty(path))
                query = query.Where(l => l.Path.Contains(path));
            if (statusCode.HasValue)
                query = query.Where(l => l.StatusCode == statusCode.Value);

            var total = await query.CountAsync();
            var logs = await query
                .OrderByDescending(l => l.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(l => new
                {
                    l.Id, l.Method, l.Path, l.StatusCode,
                    l.QueryString, l.UserId, l.IpAddress,
                    l.DurationMs, l.CreatedAt
                })
                .ToListAsync();

            return Ok(new { total, page, pageSize, logs });
        }

        // GET api/logs/api/{id} - full detail including bodies
        [HttpGet("api/{id}")]
        public async Task<IActionResult> GetApiLogDetail(int id)
        {
            var log = await _context.ApiRequestLogs.FindAsync(id);
            if (log == null) return NotFound();
            return Ok(log);
        }
    }
}
