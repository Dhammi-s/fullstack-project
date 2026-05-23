using Microsoft.AspNetCore.Identity;
using fullstack_project.Server.Models;
using fullstack_project.Server.Data;

namespace fullstack_project.Server.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(IServiceProvider services)
        {
            var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
            var db = services.GetRequiredService<ApplicationDbContext>();

            // Seed Roles
            string[] roles = { "Admin", "Worker", "Customer" };
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                    await roleManager.CreateAsync(new IdentityRole(role));
            }

            // Seed Admin
            if (await userManager.FindByEmailAsync("admin@dailyneeds.com") == null)
            {
                var admin = new ApplicationUser
                {
                    UserName = "admin@dailyneeds.com",
                    Email = "admin@dailyneeds.com",
                    FullName = "Admin User",
                    IsActive = true
                };
                await userManager.CreateAsync(admin, "Admin@123456");
                await userManager.AddToRoleAsync(admin, "Admin");
            }

            // Seed Worker
            if (await userManager.FindByEmailAsync("worker@dailyneeds.com") == null)
            {
                var worker = new ApplicationUser
                {
                    UserName = "worker@dailyneeds.com",
                    Email = "worker@dailyneeds.com",
                    FullName = "John Worker",
                    Skills = "Plumbing, Electrical",
                    HourlyRate = 25,
                    Bio = "Experienced plumber with 10 years of experience",
                    IsActive = true,
                    IsAvailable = true
                };
                await userManager.CreateAsync(worker, "Worker@123456");
                await userManager.AddToRoleAsync(worker, "Worker");
            }

            // Seed Customer
            if (await userManager.FindByEmailAsync("customer@dailyneeds.com") == null)
            {
                var customer = new ApplicationUser
                {
                    UserName = "customer@dailyneeds.com",
                    Email = "customer@dailyneeds.com",
                    FullName = "Jane Customer",
                    IsActive = true
                };
                await userManager.CreateAsync(customer, "Customer@123456");
                await userManager.AddToRoleAsync(customer, "Customer");
            }

            // Seed Categories
            if (!db.Categories.Any())
            {
                var categories = new List<Category>
                {
                    new() { Name = "Plumbing", Description = "All plumbing services and products", Icon = "🔧", ImageUrl = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400" },
                    new() { Name = "Carpentry", Description = "Wood work and furniture services", Icon = "🪚", ImageUrl = "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400" },
                    new() { Name = "Electrical", Description = "Electrical installation and repair", Icon = "⚡", ImageUrl = "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400" },
                    new() { Name = "Construction", Description = "Small construction and renovation work", Icon = "🏗️", ImageUrl = "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400" },
                    new() { Name = "Cleaning", Description = "Home and office cleaning services", Icon = "🧹", ImageUrl = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400" },
                    new() { Name = "Painting", Description = "Interior and exterior painting", Icon = "🎨", ImageUrl = "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=400" },
                    new() { Name = "Landscaping", Description = "Garden and lawn care", Icon = "🌱", ImageUrl = "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400" },
                    new() { Name = "HVAC", Description = "Heating, ventilation, and AC services", Icon = "❄️", ImageUrl = "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400" }
                };
                db.Categories.AddRange(categories);
                await db.SaveChangesAsync();
            }

            // Seed Products
            if (!db.Products.Any())
            {
                var plumbingCat = db.Categories.First(c => c.Name == "Plumbing");
                var carpCat = db.Categories.First(c => c.Name == "Carpentry");
                var elecCat = db.Categories.First(c => c.Name == "Electrical");

                var products = new List<Product>
                {
                    new() { Name = "PVC Pipe 1 inch", Description = "High quality PVC pipe for water supply", Price = 12.99m, Stock = 100, Brand = "PlumbPro", CategoryId = plumbingCat.Id, ImageUrl = "https://images.unsplash.com/photo-1558618047-3c8c76ca7d63?w=400" },
                    new() { Name = "Pipe Wrench", Description = "Heavy duty pipe wrench", Price = 34.99m, Stock = 50, Brand = "ToolMaster", CategoryId = plumbingCat.Id, ImageUrl = "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400" },
                    new() { Name = "Faucet Set", Description = "Modern chrome faucet set", Price = 89.99m, Stock = 30, Brand = "AquaFlow", CategoryId = plumbingCat.Id, ImageUrl = "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=400" },
                    new() { Name = "Wood Chisel Set", Description = "Professional wood chisel set - 6 pieces", Price = 45.99m, Stock = 25, Brand = "CraftPro", CategoryId = carpCat.Id, ImageUrl = "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400" },
                    new() { Name = "Power Drill", Description = "Cordless power drill 18V", Price = 129.99m, Stock = 20, Brand = "PowerMax", CategoryId = carpCat.Id, ImageUrl = "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400" },
                    new() { Name = "LED Bulb Pack", Description = "Energy saving LED bulbs - 10 pack", Price = 24.99m, Stock = 200, Brand = "BrightLight", CategoryId = elecCat.Id, ImageUrl = "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400" },
                    new() { Name = "Circuit Breaker", Description = "20A circuit breaker for home use", Price = 18.99m, Stock = 75, Brand = "ElecSafe", CategoryId = elecCat.Id, ImageUrl = "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400" },
                    new() { Name = "Electrical Wire 100ft", Description = "12 AWG electrical wire", Price = 49.99m, Stock = 60, Brand = "WirePro", CategoryId = elecCat.Id, ImageUrl = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400" }
                };
                db.Products.AddRange(products);
                await db.SaveChangesAsync();
            }

            // Seed Services
            if (!db.Services.Any())
            {
                var worker = await userManager.FindByEmailAsync("worker@dailyneeds.com");
                if (worker != null)
                {
                    var plumbingCat = db.Categories.First(c => c.Name == "Plumbing");
                    var carpCat = db.Categories.First(c => c.Name == "Carpentry");
                    var elecCat = db.Categories.First(c => c.Name == "Electrical");
                    var cleanCat = db.Categories.First(c => c.Name == "Cleaning");

                    var workerServices = new List<Service>
                    {
                        new() { Title = "Pipe Repair & Installation", Description = "Professional pipe repair and installation service. We fix leaks, install new pipes, and more.", Price = 75m, PriceType = "Fixed", CategoryId = plumbingCat.Id, WorkerId = worker.Id, ImageUrl = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400" },
                        new() { Title = "Drain Cleaning", Description = "Complete drain cleaning and unclogging service for all types of drains.", Price = 50m, PriceType = "Fixed", CategoryId = plumbingCat.Id, WorkerId = worker.Id, ImageUrl = "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=400" },
                        new() { Title = "Furniture Assembly", Description = "Professional furniture assembly service for IKEA and all other brands.", Price = 45m, PriceType = "Hourly", CategoryId = carpCat.Id, WorkerId = worker.Id, ImageUrl = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400" },
                        new() { Title = "Cabinet Installation", Description = "Custom cabinet installation for kitchen and bathroom.", Price = 120m, PriceType = "Fixed", CategoryId = carpCat.Id, WorkerId = worker.Id, ImageUrl = "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400" },
                        new() { Title = "Electrical Wiring", Description = "Safe and certified electrical wiring for new construction or renovation.", Price = 85m, PriceType = "Hourly", CategoryId = elecCat.Id, WorkerId = worker.Id, ImageUrl = "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400" },
                        new() { Title = "Home Deep Cleaning", Description = "Complete home deep cleaning service including all rooms.", Price = 150m, PriceType = "Fixed", CategoryId = cleanCat.Id, WorkerId = worker.Id, ImageUrl = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400" }
                    };
                    db.Services.AddRange(workerServices);
                    await db.SaveChangesAsync();
                }
            }
        }
    }
}
