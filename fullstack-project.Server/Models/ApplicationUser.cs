using Microsoft.AspNetCore.Identity;

namespace fullstack_project.Server.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string FullName { get; set; } = string.Empty;
        public string? ProfileImage { get; set; }
        public string? Address { get; set; }
        public string? Phone { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;

        // Worker specific fields
        public string? Skills { get; set; }
        public string? Bio { get; set; }
        public decimal HourlyRate { get; set; }
        public double Rating { get; set; } = 0;
        public int TotalReviews { get; set; } = 0;
        public bool IsAvailable { get; set; } = true;

        public ICollection<Order> Orders { get; set; } = new List<Order>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
        public ICollection<ChatMessage> SentMessages { get; set; } = new List<ChatMessage>();
        public ICollection<ChatMessage> ReceivedMessages { get; set; } = new List<ChatMessage>();
    }
}
