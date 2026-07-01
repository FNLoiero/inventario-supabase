using Microsoft.AspNetCore.Mvc;
using InventarioAPI.Models;
using InventarioAPI.Services;

namespace InventarioAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController(SupabaseService sb) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var data = await sb.GetCategoriesAsync();
        return Ok(data);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var item = await sb.GetCategoryAsync(id);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Category input)
    {
        var created = await sb.CreateCategoryAsync(input);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, Category input)
    {
        var updated = await sb.UpdateCategoryAsync(id, input);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await sb.DeleteCategoryAsync(id);
        return NoContent();
    }
}
