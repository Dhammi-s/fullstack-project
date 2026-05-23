using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.Checkout;
using fullstack_project.Server.Data;
using fullstack_project.Server.DTOs;
using System.Security.Claims;

namespace fullstack_project.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IConfiguration _config;

        public PaymentController(ApplicationDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
            StripeConfiguration.ApiKey = config["Stripe:SecretKey"];
        }

        [HttpPost("create-payment-intent")]
        public async Task<IActionResult> CreatePaymentIntent([FromBody] CreatePaymentIntentDto dto)
        {
            var order = await _db.Orders.FindAsync(dto.OrderId);
            if (order == null) return NotFound();

            var options = new PaymentIntentCreateOptions
            {
                Amount = (long)(order.TotalAmount * 100),
                Currency = "usd",
                Metadata = new Dictionary<string, string>
                {
                    { "orderId", order.Id.ToString() },
                    { "orderNumber", order.OrderNumber }
                }
            };

            var service = new PaymentIntentService();
            var paymentIntent = await service.CreateAsync(options);

            order.StripePaymentIntentId = paymentIntent.Id;
            await _db.SaveChangesAsync();

            return Ok(new PaymentIntentResponseDto
            {
                ClientSecret = paymentIntent.ClientSecret,
                PaymentIntentId = paymentIntent.Id
            });
        }

        [HttpPost("create-checkout-session")]
        public async Task<IActionResult> CreateCheckoutSession([FromBody] CreatePaymentIntentDto dto)
        {
            var order = await _db.Orders
                .Include(o => o.OrderItems).ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(o => o.Id == dto.OrderId);
            if (order == null) return NotFound();

            var lineItems = new List<SessionLineItemOptions>();

            if (order.OrderItems.Any())
            {
                foreach (var item in order.OrderItems)
                {
                    lineItems.Add(new SessionLineItemOptions
                    {
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            Currency = "usd",
                            UnitAmount = (long)(item.UnitPrice * 100),
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = item.Product?.Name ?? "Item"
                            }
                        },
                        Quantity = item.Quantity
                    });
                }
            }
            else
            {
                lineItems.Add(new SessionLineItemOptions
                {
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        Currency = "usd",
                        UnitAmount = (long)(order.TotalAmount * 100),
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = order.OrderNumber
                        }
                    },
                    Quantity = 1
                });
            }

            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = lineItems,
                Mode = "payment",
                SuccessUrl = $"{_config["Jwt:Audience"]}/payment-success?session_id={{CHECKOUT_SESSION_ID}}&orderId={order.Id}",
                CancelUrl = $"{_config["Jwt:Audience"]}/payment-cancel?orderId={order.Id}",
                Metadata = new Dictionary<string, string>
                {
                    { "orderId", order.Id.ToString() }
                }
            };

            var sessionService = new SessionService();
            var session = await sessionService.CreateAsync(options);

            order.StripeSessionId = session.Id;
            await _db.SaveChangesAsync();

            return Ok(new { sessionId = session.Id, url = session.Url });
        }

        [HttpPost("confirm/{orderId}")]
        public async Task<IActionResult> ConfirmPayment(int orderId, [FromBody] string paymentIntentId)
        {
            var order = await _db.Orders.FindAsync(orderId);
            if (order == null) return NotFound();

            order.PaymentStatus = "Paid";
            order.Status = "Confirmed";
            order.UpdatedAt = DateTime.UtcNow;

            _db.Notifications.Add(new Models.Notification
            {
                UserId = order.CustomerId,
                Title = "Payment Successful",
                Message = $"Payment for order {order.OrderNumber} confirmed.",
                Type = "Success"
            });

            await _db.SaveChangesAsync();
            return Ok(new { message = "Payment confirmed" });
        }

        [HttpPost("webhook")]
        [AllowAnonymous]
        public async Task<IActionResult> Webhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            try
            {
                var stripeEvent = EventUtility.ParseEvent(json);

                if (stripeEvent.Type == EventTypes.PaymentIntentSucceeded)
                {
                    var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
                    if (paymentIntent?.Metadata.TryGetValue("orderId", out var orderIdStr) == true &&
                        int.TryParse(orderIdStr, out var orderId))
                    {
                        var order = await _db.Orders.FindAsync(orderId);
                        if (order != null)
                        {
                            order.PaymentStatus = "Paid";
                            order.Status = "Confirmed";
                            await _db.SaveChangesAsync();
                        }
                    }
                }

                return Ok();
            }
            catch
            {
                return BadRequest();
            }
        }
    }
}
