using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace fullstack_project.Server.Services
{
    public interface IEmailService
    {
        Task SendAsync(string toEmail, string toName, string subject, string htmlBody);
        Task SendWelcomeAsync(string toEmail, string toName, string role);
        Task SendOrderConfirmationAsync(string toEmail, string toName, string orderNumber, decimal amount, string? serviceTitle, string paymentMethod, DateTime? scheduledAt);
        Task SendWorkerAssignedAsync(string workerEmail, string workerName, string orderNumber, string customerName, string? serviceTitle, DateTime? scheduledAt, string address);
        Task SendAdminNotificationAsync(string subject, string htmlBody);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration config, ILogger<EmailService> logger)
        {
            _config = config;
            _logger = logger;
        }

        // ── Helpers ─────────────────────────────────────────────────────────────────

        private static string Wrap(string gradientColors, string headerHtml, string bodyHtml) =>
$@"<!DOCTYPE html>
<html lang='en'>
<head><meta charset='UTF-8'/><meta name='viewport' content='width=device-width,initial-scale=1.0'/></head>
<body style='margin:0;padding:0;background:#F0F4F8;font-family:-apple-system,BlinkMacSystemFont,""Segoe UI"",Roboto,Arial,sans-serif;'>
<table width='100%' cellpadding='0' cellspacing='0' style='background:#F0F4F8;padding:40px 16px;'>
<tr><td align='center'>
<table width='600' cellpadding='0' cellspacing='0' style='max-width:600px;width:100%;'>

  <!-- HEADER -->
  <tr><td style='background:linear-gradient(135deg,{gradientColors});border-radius:16px 16px 0 0;padding:40px 48px;text-align:center;'>
    <div style='display:inline-block;background:rgba(255,255,255,0.18);border-radius:14px;padding:12px 16px;margin-bottom:18px;font-size:32px;line-height:1;'>🔧</div>
    <div style='color:rgba(255,255,255,0.80);font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:700;margin-bottom:12px;'>DailyNeeds Platform</div>
    {headerHtml}
  </td></tr>

  <!-- BODY -->
  <tr><td style='background:#ffffff;padding:44px 48px;'>{bodyHtml}</td></tr>

  <!-- FOOTER -->
  <tr><td style='background:#F8FAFC;border-top:1px solid #E2E8F0;border-radius:0 0 16px 16px;padding:24px 48px;text-align:center;'>
    <p style='margin:0 0 6px;font-size:12px;color:#94A3B8;'>You received this because you have a DailyNeeds account.</p>
    <p style='margin:0;font-size:11px;color:#CBD5E1;'>
      &copy; {DateTime.UtcNow.Year} DailyNeeds &nbsp;&bull;&nbsp;
      <a href='https://daily-needs.runasp.net' style='color:#94A3B8;text-decoration:none;'>Visit Website</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>";

        private static string InfoRow(string label, string value) =>
$@"<tr>
  <td style='padding:11px 20px;border-bottom:1px solid #F1F5F9;font-size:13px;color:#94A3B8;font-weight:500;width:40%;'>{label}</td>
  <td style='padding:11px 20px;border-bottom:1px solid #F1F5F9;font-size:13px;color:#1E293B;font-weight:600;text-align:right;'>{value}</td>
</tr>";

        private static string StatCard(string emoji, string label, string value, string color) =>
$@"<td style='text-align:center;padding:0 6px;'>
  <div style='background:{color}14;border:1px solid {color}28;border-radius:12px;padding:14px 10px;'>
    <div style='font-size:20px;margin-bottom:5px;'>{emoji}</div>
    <div style='font-size:10px;color:#64748B;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:3px;'>{label}</div>
    <div style='font-size:16px;font-weight:800;color:{color};'>{value}</div>
  </div>
</td>";

        private static string CtaButton(string text, string url, string color) =>
$@"<a href='{url}' style='display:inline-block;background:{color};color:#fff;text-decoration:none;
   font-size:15px;font-weight:700;padding:15px 36px;border-radius:10px;
   box-shadow:0 4px 14px {color}40;letter-spacing:0.3px;'>{text}</a>";

        // ── SendAsync ────────────────────────────────────────────────────────────────

        public async Task SendAsync(string toEmail, string toName, string subject, string htmlBody)
        {
            try
            {
                var msg = new MimeMessage();
                msg.From.Add(new MailboxAddress(_config["Email:FromName"] ?? "DailyNeeds", _config["Email:FromEmail"]!));
                msg.To.Add(new MailboxAddress(toName, toEmail));
                msg.Subject = subject;
                msg.Body = new TextPart("html") { Text = htmlBody };

                using var client = new SmtpClient();
                await client.ConnectAsync(_config["Email:SmtpHost"]!, int.Parse(_config["Email:SmtpPort"] ?? "587"), SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(_config["Email:SmtpUser"]!, _config["Email:SmtpPass"]!);
                await client.SendAsync(msg);
                await client.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
            }
        }

        // ── Welcome Email ────────────────────────────────────────────────────────────

        public async Task SendWelcomeAsync(string toEmail, string toName, string role)
        {
            bool isWorker = role == "Worker";
            string gradient   = isWorker ? "#059669,#047857" : "#2563EB,#1D4ED8";
            string accent     = isWorker ? "#059669" : "#2563EB";
            string emoji      = isWorker ? "🔧" : "🎉";
            string badge      = isWorker ? "Worker Account" : "Customer Account";
            string badgeBg    = isWorker ? "#D1FAE5" : "#DBEAFE";
            string badgeColor = isWorker ? "#065F46" : "#1E40AF";
            string ctaUrl     = isWorker ? "https://daily-needs.runasp.net/worker" : "https://daily-needs.runasp.net";
            string ctaLabel   = isWorker ? "Go to My Dashboard →" : "Start Exploring →";

            string[] bullets = isWorker
                ? new[] { "📋 Receive and manage job assignments", "💬 Chat directly with customers", "📅 View your schedule at a glance", "💰 Track earnings in real-time", "⭐ Build your reputation with reviews" }
                : new[] { "🔍 Browse 100+ verified home services", "📦 Shop quality everyday products", "👷 Book trusted, rated workers", "💬 Chat with your assigned worker", "⭐ Rate and review after every job" };

            string bulletRows = string.Join("\n", bullets.Select(b =>
                $"<tr><td style='padding:7px 0;font-size:14px;color:#334155;'>" +
                $"<span style='display:inline-block;background:{accent}18;color:{accent};font-weight:700;border-radius:5px;padding:1px 8px;margin-right:8px;font-size:12px;'>✓</span>{b}</td></tr>"));

            string header = $@"
<h1 style='margin:0;color:#fff;font-size:28px;font-weight:800;letter-spacing:-0.5px;'>Welcome, {toName.Split(' ')[0]}! {emoji}</h1>
<p style='margin:10px 0 0;color:rgba(255,255,255,0.78);font-size:15px;'>Your account is ready — let's get started</p>";

            string body = $@"
<div style='margin-bottom:24px;'>
  <span style='background:{badgeBg};color:{badgeColor};font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:5px 14px;border-radius:20px;'>{badge}</span>
</div>

<p style='margin:0 0 24px;font-size:16px;color:#475569;line-height:1.75;'>
  Hi <strong style='color:#1E293B;'>{toName}</strong>,<br/>
  We're excited to have you on <strong>DailyNeeds</strong> — your all-in-one home services platform.
  Your account has been created successfully.
</p>

<div style='background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:20px 24px;margin-bottom:32px;'>
  <p style='margin:0 0 14px;font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;'>What you can do</p>
  <table width='100%' cellpadding='0' cellspacing='0'>{bulletRows}</table>
</div>

<div style='text-align:center;margin-bottom:28px;'>
  {CtaButton(ctaLabel, ctaUrl, accent)}
</div>

<p style='margin:0;font-size:13px;color:#94A3B8;border-top:1px solid #F1F5F9;padding-top:18px;line-height:1.6;'>
  Have questions? Just reply to this email — our team is always happy to help. 💙
</p>";

            await SendAsync(toEmail, toName, $"Welcome to DailyNeeds, {toName}! {emoji}", Wrap(gradient, header, body));
        }

        // ── Order Confirmation ───────────────────────────────────────────────────────

        public async Task SendOrderConfirmationAsync(string toEmail, string toName, string orderNumber,
            decimal amount, string? serviceTitle, string paymentMethod, DateTime? scheduledAt)
        {
            bool isCOD = paymentMethod == "COD";
            string payBadge = isCOD
                ? "<span style='background:#FEF3C7;color:#92400E;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;'>💵 Cash on Delivery</span>"
                : "<span style='background:#DBEAFE;color:#1E40AF;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;'>💳 Online Payment</span>";

            string schedRow = scheduledAt.HasValue
                ? InfoRow("📅 Scheduled", scheduledAt.Value.ToString("ddd, MMM d yyyy · h:mm tt"))
                : "";

            string payNote = isCOD
                ? $@"<div style='background:#FFFBEB;border:1px solid #FDE68A;border-radius:10px;padding:16px 20px;margin:24px 0;'>
                     <p style='margin:0;font-size:14px;color:#92400E;line-height:1.6;'>
                       <strong>💵 Cash on Delivery</strong> — Please have <strong style='font-size:16px;'>${amount:F2}</strong> ready in cash when your worker arrives.</p></div>"
                : $@"<div style='background:#EFF6FF;border:1px solid #BFDBFE;border-radius:10px;padding:16px 20px;margin:24px 0;'>
                     <p style='margin:0;font-size:14px;color:#1E40AF;line-height:1.6;'>
                       <strong>💳 Online Payment</strong> — Complete your payment in the app to confirm your booking.</p></div>";

            string header = $@"
<div style='background:rgba(255,255,255,0.18);border-radius:12px;padding:12px 18px;margin-bottom:16px;display:inline-block;font-size:36px;line-height:1;'>✅</div>
<h1 style='margin:0;color:#fff;font-size:28px;font-weight:800;letter-spacing:-0.5px;'>Order Confirmed!</h1>
<p style='margin:10px 0 0;color:rgba(255,255,255,0.78);font-size:15px;'>Your booking is locked in. We're on it!</p>";

            string body = $@"
<p style='margin:0 0 24px;font-size:16px;color:#475569;line-height:1.75;'>
  Hi <strong style='color:#1E293B;'>{toName}</strong>, your order has been placed successfully.
  A verified worker will be assigned to you shortly.
</p>

<!-- Order number banner -->
<div style='background:linear-gradient(135deg,#EFF6FF,#DBEAFE);border:1px solid #BFDBFE;border-radius:12px;padding:18px 24px;margin-bottom:28px;text-align:center;'>
  <p style='margin:0;font-size:11px;color:#3B82F6;text-transform:uppercase;letter-spacing:2px;font-weight:700;'>Order Reference</p>
  <p style='margin:6px 0 0;font-size:28px;font-weight:800;color:#1E40AF;letter-spacing:1px;'>#{orderNumber}</p>
</div>

<!-- Details table -->
<div style='border:1px solid #E2E8F0;border-radius:12px;overflow:hidden;margin-bottom:4px;'>
  <div style='background:#F8FAFC;padding:12px 20px;border-bottom:1px solid #E2E8F0;'>
    <span style='font-size:11px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:1.5px;'>Order Details</span>
  </div>
  <table width='100%' cellpadding='0' cellspacing='0'>
    {(serviceTitle != null ? InfoRow("🔧 Service", serviceTitle) : "")}
    {InfoRow("💰 Amount", $"<span style='color:#059669;font-size:17px;font-weight:800;'>${amount:F2}</span>")}
    {InfoRow("💳 Payment Method", payBadge)}
    {schedRow}
    {InfoRow("📆 Placed On", DateTime.UtcNow.ToString("MMM d, yyyy · HH:mm") + " UTC")}
  </table>
</div>

{payNote}

<!-- Stats row -->
<table width='100%' cellpadding='0' cellspacing='0' style='margin:24px 0;'>
  <tr>
    {StatCard("📋", "Status", "Confirmed", "#2563EB")}
    {StatCard("⏱️", "Assign Time", "~2 hrs", "#7C3AED")}
    {StatCard("⭐", "Avg Rating", "4.9 / 5", "#D97706")}
  </tr>
</table>

<div style='text-align:center;margin-bottom:24px;'>
  {CtaButton("Track My Order →", "https://daily-needs.runasp.net/orders", "#2563EB")}
</div>

<p style='margin:0;font-size:13px;color:#94A3B8;border-top:1px solid #F1F5F9;padding-top:18px;'>
  Questions about your order? Chat with your worker directly through the app.
</p>";

            await SendAsync(toEmail, toName, $"✅ Order Confirmed — #{orderNumber}", Wrap("#2563EB,#1D4ED8", header, body));
        }

        // ── Worker Assigned ──────────────────────────────────────────────────────────

        public async Task SendWorkerAssignedAsync(string workerEmail, string workerName, string orderNumber,
            string customerName, string? serviceTitle, DateTime? scheduledAt, string address)
        {
            string schedRow = scheduledAt.HasValue
                ? InfoRow("📅 Scheduled", scheduledAt.Value.ToString("ddd, MMM d yyyy · h:mm tt"))
                : InfoRow("📅 Schedule", "Contact customer to confirm time");

            string header = $@"
<div style='background:rgba(255,255,255,0.18);border-radius:12px;padding:12px 18px;margin-bottom:16px;display:inline-block;font-size:36px;line-height:1;'>🔧</div>
<h1 style='margin:0;color:#fff;font-size:28px;font-weight:800;letter-spacing:-0.5px;'>New Job Assigned!</h1>
<p style='margin:10px 0 0;color:rgba(255,255,255,0.78);font-size:15px;'>A customer is waiting for your expertise</p>";

            string body = $@"
<p style='margin:0 0 24px;font-size:16px;color:#475569;line-height:1.75;'>
  Hi <strong style='color:#1E293B;'>{workerName}</strong>, you've been assigned a new job.
  Review the details below and reach out to the customer to confirm timing.
</p>

<!-- Job reference banner -->
<div style='background:linear-gradient(135deg,#ECFDF5,#D1FAE5);border:1px solid #A7F3D0;border-radius:12px;padding:18px 24px;margin-bottom:28px;text-align:center;'>
  <p style='margin:0;font-size:11px;color:#059669;text-transform:uppercase;letter-spacing:2px;font-weight:700;'>Job Reference</p>
  <p style='margin:6px 0 0;font-size:28px;font-weight:800;color:#065F46;letter-spacing:1px;'>#{orderNumber}</p>
</div>

<!-- Details table -->
<div style='border:1px solid #E2E8F0;border-radius:12px;overflow:hidden;margin-bottom:28px;'>
  <div style='background:#F0FDF4;padding:12px 20px;border-bottom:1px solid #D1FAE5;'>
    <span style='font-size:11px;font-weight:700;color:#059669;text-transform:uppercase;letter-spacing:1.5px;'>Job Details</span>
  </div>
  <table width='100%' cellpadding='0' cellspacing='0'>
    {InfoRow("👤 Customer", customerName)}
    {(serviceTitle != null ? InfoRow("🔧 Service", serviceTitle) : "")}
    {InfoRow("📍 Address", address)}
    {schedRow}
  </table>
</div>

<!-- Next steps -->
<div style='background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:20px 24px;margin-bottom:28px;'>
  <p style='margin:0 0 14px;font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;'>Your Next Steps</p>
  <table width='100%' cellpadding='0' cellspacing='0'>
    <tr><td style='padding:7px 0;font-size:14px;color:#334155;'><span style='color:#059669;font-weight:800;'>1.</span> &nbsp;Log in and review full job details in the app</td></tr>
    <tr><td style='padding:7px 0;font-size:14px;color:#334155;'><span style='color:#059669;font-weight:800;'>2.</span> &nbsp;Chat with the customer to confirm arrival time</td></tr>
    <tr><td style='padding:7px 0;font-size:14px;color:#334155;'><span style='color:#059669;font-weight:800;'>3.</span> &nbsp;Complete the job and mark it as done in the app</td></tr>
    <tr><td style='padding:7px 0;font-size:14px;color:#334155;'><span style='color:#059669;font-weight:800;'>4.</span> &nbsp;Collect or confirm payment to receive your earnings</td></tr>
  </table>
</div>

<!-- Stats row -->
<table width='100%' cellpadding='0' cellspacing='0' style='margin-bottom:28px;'>
  <tr>
    {StatCard("📋", "Status", "Assigned", "#059669")}
    {StatCard("💬", "Chat", "Open Now", "#2563EB")}
    {StatCard("💰", "Payout", "On Complete", "#D97706")}
  </tr>
</table>

<div style='text-align:center;margin-bottom:24px;'>
  {CtaButton("View My Assignment →", "https://daily-needs.runasp.net/worker/assignments", "#059669")}
</div>

<p style='margin:0;font-size:13px;color:#94A3B8;border-top:1px solid #F1F5F9;padding-top:18px;'>
  Great work keeps great reviews coming. Do your best and we'll handle the rest! 💪
</p>";

            await SendAsync(workerEmail, workerName, $"🔧 New Job Assigned — #{orderNumber}", Wrap("#059669,#047857", header, body));
        }

        // ── Admin Notification ───────────────────────────────────────────────────────

        public async Task SendAdminNotificationAsync(string subject, string htmlBody)
        {
            string header = $@"
<div style='background:rgba(255,255,255,0.18);border-radius:12px;padding:10px 16px;margin-bottom:16px;display:inline-block;font-size:28px;line-height:1;'>🛡️</div>
<h1 style='margin:0;color:#fff;font-size:24px;font-weight:800;'>Admin Notification</h1>
<p style='margin:10px 0 0;color:rgba(255,255,255,0.75);font-size:14px;'>{subject}</p>";

            string body = $@"
<div style='background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:24px 28px;margin-bottom:24px;font-size:14px;color:#334155;line-height:1.8;'>
  {htmlBody}
</div>
<div style='text-align:center;margin-bottom:24px;'>
  {CtaButton("Open Admin Dashboard →", "https://daily-needs.runasp.net/admin", "#7C3AED")}
</div>
<p style='margin:0;font-size:12px;color:#94A3B8;border-top:1px solid #F1F5F9;padding-top:16px;text-align:center;'>
  🕐 Generated at {DateTime.UtcNow:ddd, MMM d yyyy · HH:mm} UTC
</p>";

            string adminEmail = _config["Email:AdminEmail"] ?? "jassadhammi@gmail.com";
            await SendAsync(adminEmail, "Admin", subject, Wrap("#7C3AED,#6D28D9", header, body));
        }
    }
}
