// Placeholder C# controller to show where backend logic will live.
// This follows the MVC pattern: Controllers receive requests, coordinate with Models, and return Views or API responses.
using Microsoft.AspNetCore.Mvc;

namespace WanderSync.Backend.Controllers
{
    public class HomeController : Controller
    {
        // GET: /Home/Index
        // This action would typically return the main app shell or API entry point for the React frontend.
        public IActionResult Index()
        {
            // In production, this could return the React app index page or a JSON API response.
            return View();
        }
    }
}
