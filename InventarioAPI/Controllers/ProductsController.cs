using Microsoft.AspNetCore.Mvc;
using InventarioAPI.Models;
using InventarioAPI.Services;

namespace InventarioAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(SupabaseService sb) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? q,
        [FromQuery] string? category,
        [FromQuery] string? status)
    {
        var data = await sb.GetProductsAsync(q, category, status);
        return Ok(data);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var item = await sb.GetProductAsync(id);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Product input)
    {
        var (created, duplicate) = await sb.CreateProductAsync(input);
        if (duplicate) return Conflict(new { error = "Ya existe un producto con ese SKU." });
        return CreatedAtAction(nameof(GetById), new { id = created!.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, Product input)
    {
        var (updated, duplicate) = await sb.UpdateProductAsync(id, input);
        if (duplicate) return Conflict(new { error = "Ya existe un producto con ese SKU." });
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await sb.DeleteProductAsync(id);
        return NoContent();
    }

    [HttpGet("{id:guid}/movements")]
    public async Task<IActionResult> GetMovements(Guid id)
    {
        var data = await sb.GetMovementsAsync(id);
        return Ok(data);
    }
}
