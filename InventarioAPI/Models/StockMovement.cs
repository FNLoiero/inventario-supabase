using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InventarioAPI.Models;

[Table("stock_movements")]
public class StockMovement
{
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [Column("product_id")]
    public Guid ProductId { get; set; }

    [Required]
    [Column("movement_type")]
    public string MovementType { get; set; } = "in"; // "in" | "out" | "adjustment"

    [Column("quantity")]
    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    [Column("reference")]
    public string? Reference { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navegación
    [ForeignKey("ProductId")]
    public Product? Product { get; set; }
}
