namespace fullstack_project.Server.Models
{
    public class Order
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending"; // Pending, Confirmed, InProgress, Completed, Cancelled
        public decimal TotalAmount { get; set; }
        public string PaymentStatus { get; set; } = "Pending"; // Pending, Paid, Failed, Refunded
        public string? StripePaymentIntentId { get; set; }
        public string? StripeSessionId { get; set; }
        public string OrderType { get; set; } = "Product"; // Product, Service
        public string? Notes { get; set; }
        public string? Address { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? ScheduledAt { get; set; }
        public DateTime? CompletedAt { get; set; }

        public string CustomerId { get; set; } = string.Empty;
        public ApplicationUser? Customer { get; set; }

        public string? WorkerId { get; set; }
        public ApplicationUser? Worker { get; set; }

        public int? ServiceId { get; set; }
        public Service? Service { get; set; }

        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
    }

    public class OrderItem
    {
        public int Id { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }

        public int OrderId { get; set; }
        public Order? Order { get; set; }

        public int? ProductId { get; set; }
        public Product? Product { get; set; }
    }

    public class Cart
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public ApplicationUser? User { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    }

    public class CartItem
    {
        public int Id { get; set; }
        public int Quantity { get; set; }

        public int CartId { get; set; }
        public Cart? Cart { get; set; }

        public int? ProductId { get; set; }
        public Product? Product { get; set; }

        public int? ServiceId { get; set; }
        public Service? Service { get; set; }
    }
}
