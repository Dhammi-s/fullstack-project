using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using fullstack_project.Server.Data;
using fullstack_project.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace fullstack_project.Server.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly ApplicationDbContext _db;
        private static readonly Dictionary<string, string> _connections = new();

        public ChatHub(ApplicationDbContext db)
        {
            _db = db;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier;
            if (userId != null)
            {
                _connections[userId] = Context.ConnectionId;
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.UserIdentifier;
            if (userId != null)
            {
                _connections.Remove(userId);
            }
            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessage(string receiverId, string message)
        {
            var senderId = Context.UserIdentifier!;
            var sender = await _db.Users.FindAsync(senderId);

            var chatMessage = new ChatMessage
            {
                SenderId = senderId,
                ReceiverId = receiverId,
                Message = message,
                SentAt = DateTime.UtcNow
            };

            _db.ChatMessages.Add(chatMessage);
            await _db.SaveChangesAsync();

            var messageDto = new
            {
                id = chatMessage.Id,
                senderId = senderId,
                senderName = sender?.FullName ?? "Unknown",
                senderImage = sender?.ProfileImage,
                receiverId = receiverId,
                message = message,
                sentAt = chatMessage.SentAt,
                isRead = false
            };

            await Clients.User(receiverId).SendAsync("ReceiveMessage", messageDto);
            await Clients.Caller.SendAsync("MessageSent", messageDto);
        }

        public async Task MarkAsRead(string senderId)
        {
            var receiverId = Context.UserIdentifier!;
            var messages = await _db.ChatMessages
                .Where(m => m.SenderId == senderId && m.ReceiverId == receiverId && !m.IsRead)
                .ToListAsync();

            foreach (var msg in messages)
            {
                msg.IsRead = true;
            }
            await _db.SaveChangesAsync();

            await Clients.User(senderId).SendAsync("MessagesRead", receiverId);
        }
    }
}
