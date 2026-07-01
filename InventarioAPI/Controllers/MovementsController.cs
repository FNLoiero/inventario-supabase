using Microsoft.AspNetCore.Mvc;
using InventarioAPI.Models;
using InventarioAPI.Services;

namespace InventarioAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MovementsController(SupabaseService sb) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] Guid? productId)
    {
        var data = await sb.GetAllMovementsAsync(productId);
        return Ok(data);
    }

    [HttpPost]
    public async Task<IActionResult> Create(StockMovement input)
    {
        var (movement, error) = await sb.CreateMovementAsync(input);
        if (error is not null) return BadRequest(new { error });
        return Ok(movement);
    }
}
