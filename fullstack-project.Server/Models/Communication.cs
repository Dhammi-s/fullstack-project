namespace fullstack_project.Server.Models
{
    public class Review
    {
        public int Id { get; set; }
        public int Rating { get; set; } // 1-5
        public string Comment { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public string UserId { get; set; } = string.Empty;
        public ApplicationUser? User { get; set; }

        public int? ServiceId { get; set; }
        public Service? Service { get; set; }

        public int? ProductId { get; set; }
        public Product? Product { get; set; }

        public int? OrderId { get; set; }
        public Order? Order { get; set; }

        public string? WorkerId { get; set; }
        public ApplicationUser? Worker { get; set; }
    }

    public class ChatMessage
    {
        public int Id { get; set; }
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; } = false;
        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        public string SenderId { get; set; } = string.Empty;
        public ApplicationUser? Sender { get; set; }

        public string ReceiverId { get; set; } = string.Empty;
        public ApplicationUser? Receiver { get; set; }
    }

    public class Notification
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = "Info"; // Info, Success, Warning, Error
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? Link { get; set; }

        public string UserId { get; set; } = string.Empty;
        public ApplicationUser? User { get; set; }
    }

    public class WorkerAvailability
    {
        public int Id { get; set; }
        public string WorkerId { get; set; } = string.Empty;
        public ApplicationUser? Worker { get; set; }
        public DayOfWeek DayOfWeek { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public bool IsAvailable { get; set; } = true;
    }
}
