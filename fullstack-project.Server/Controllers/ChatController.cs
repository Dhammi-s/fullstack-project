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
    public class ChatController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public ChatController(ApplicationDbContext db) => _db = db;

        [HttpGet("conversations")]
        public async Task<IActionResult> GetConversations()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

            var messages = await _db.ChatMessages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Where(m => m.SenderId == userId || m.ReceiverId == userId)
                .OrderByDescending(m => m.SentAt)
                .ToListAsync();

            var conversations = messages
                .GroupBy(m => m.SenderId == userId ? m.ReceiverId : m.SenderId)
                .Select(g =>
                {
                    var lastMsg = g.First();
                    var other = lastMsg.SenderId == userId ? lastMsg.Receiver : lastMsg.Sender;
                    return new
                    {
                        userId = other?.Id,
                        userName = other?.FullName,
                        userImage = other?.ProfileImage,
                        lastMessage = lastMsg.Message,
                        lastMessageAt = lastMsg.SentAt,
                        unreadCount = g.Count(m => m.ReceiverId == userId && !m.IsRead)
                    };
                })
                .ToList();

            return Ok(conversations);
        }

        [HttpGet("{otherUserId}")]
        public async Task<IActionResult> GetMessages(string otherUserId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

            var messages = await _db.ChatMessages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Where(m => (m.SenderId == userId && m.ReceiverId == otherUserId) ||
                            (m.SenderId == otherUserId && m.ReceiverId == userId))
                .OrderBy(m => m.SentAt)
                .ToListAsync();

            // Mark as read
            var unread = messages.Where(m => m.ReceiverId == userId && !m.IsRead).ToList();
            foreach (var msg in unread) msg.IsRead = true;
            await _db.SaveChangesAsync();

            return Ok(messages.Select(m => new ChatMessageDto
            {
                Id = m.Id,
                SenderId = m.SenderId,
                SenderName = m.Sender?.FullName ?? "",
                SenderImage = m.Sender?.ProfileImage,
                ReceiverId = m.ReceiverId,
                ReceiverName = m.Receiver?.FullName ?? "",
                Message = m.Message,
                IsRead = m.IsRead,
                SentAt = m.SentAt
            }));
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageDto dto)
        {
            var senderId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var msg = new ChatMessage
            {
                SenderId = senderId,
                ReceiverId = dto.ReceiverId,
                Message = dto.Message
            };
            _db.ChatMessages.Add(msg);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Message sent" });
        }
    }
}
