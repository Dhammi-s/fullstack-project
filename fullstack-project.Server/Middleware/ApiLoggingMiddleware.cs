using System.Diagnostics;
using System.Security.Claims;
using System.Text;
using fullstack_project.Server.Data;
using fullstack_project.Server.Models;

namespace fullstack_project.Server.Middleware
{
    public class ApiLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IServiceScopeFactory _scopeFactory;
        private static readonly HashSet<string> _skipPaths =
            new(StringComparer.OrdinalIgnoreCase) { "/hubs", "/swagger", "/_framework", "/_vs" };

        public ApiLoggingMiddleware(RequestDelegate next, IServiceScopeFactory scopeFactory)
        {
            _next = next;
            _scopeFactory = scopeFactory;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var path = context.Request.Path.Value ?? string.Empty;
            if (_skipPaths.Any(s => path.StartsWith(s, StringComparison.OrdinalIgnoreCase)))
            {
                await _next(context);
                return;
            }

            var sw = Stopwatch.StartNew();

            context.Request.EnableBuffering();
            string requestBody = string.Empty;
            if (context.Request.ContentLength > 0 && context.Request.ContentLength < 50_000)
            {
                using var reader = new StreamReader(context.Request.Body, Encoding.UTF8, leaveOpen: true);
                requestBody = await reader.ReadToEndAsync();
                context.Request.Body.Position = 0;
            }

            var originalBody = context.Response.Body;
            using var responseBuffer = new MemoryStream();
            context.Response.Body = responseBuffer;

            try
            {
                await _next(context);
            }
            finally
            {
                sw.Stop();
                responseBuffer.Position = 0;

                string responseBody = string.Empty;
                if (responseBuffer.Length < 50_000)
                {
                    using var reader = new StreamReader(responseBuffer, Encoding.UTF8, leaveOpen: true);
                    responseBody = await reader.ReadToEndAsync();
                }

                responseBuffer.Position = 0;
                await responseBuffer.CopyToAsync(originalBody);
                context.Response.Body = originalBody;

                var userId = context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
                var ip = context.Connection.RemoteIpAddress?.ToString();

                var log = new ApiRequestLog
                {
                    Method = context.Request.Method,
                    Path = path,
                    StatusCode = context.Response.StatusCode,
                    QueryString = context.Request.QueryString.Value,
                    RequestBody = string.IsNullOrWhiteSpace(requestBody) ? null : requestBody,
                    ResponseBody = string.IsNullOrWhiteSpace(responseBody) ? null : responseBody,
                    UserId = userId,
                    IpAddress = ip,
                    DurationMs = sw.ElapsedMilliseconds,
                    CreatedAt = DateTime.UtcNow
                };

                _ = SaveLogAsync(log);
            }
        }

        private async Task SaveLogAsync(ApiRequestLog log)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                db.ApiRequestLogs.Add(log);
                await db.SaveChangesAsync();
            }
            catch
            {
                // never let logging crash the app
            }
        }
    }
}
