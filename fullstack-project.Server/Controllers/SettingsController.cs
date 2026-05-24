using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using fullstack_project.Server.DTOs;
using System.Security.Claims;

namespace fullstack_project.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SettingsController : ControllerBase
    {
        // In-memory singleton settings (no DB migration needed for viva demo)
        private static AppSettingsDto _settings = new();

        [HttpGet]
        [AllowAnonymous]
        public IActionResult Get() => Ok(_settings);

        [HttpPut]
        [Authorize(Roles = "Admin")]
        public IActionResult Update([FromBody] AppSettingsDto dto)
        {
            _settings = dto;
            return Ok(_settings);
        }

        [HttpGet("public")]
        [AllowAnonymous]
        public IActionResult GetPublic() => Ok(new
        {
            siteName = _settings.SiteName,
            currency = _settings.Currency,
            allowCOD = _settings.AllowCOD,
            allowOnlinePayment = _settings.AllowOnlinePayment,
            showWorkerRatings = _settings.ShowWorkerRatings,
            maintenanceMode = _settings.MaintenanceMode,
        });
    }
}
