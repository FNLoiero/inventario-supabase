using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InventarioAPI.Models;

[Table("products")]
public class Product
{
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Required]
    [Column("sku")]
    public string Sku { get; set; } = string.Empty;

    [Required]
    [Column("category_id")]
    public Guid CategoryId { get; set; }

    [Column("price")]
    [Range(0, double.MaxValue)]
    public decimal Price { get; set; }

    [Column("stock")]
    [Range(0, int.MaxValue)]
    public int Stock { get; set; }

    [Column("min_stock")]
    [Range(0, int.MaxValue)]
    public int MinStock { get; set; } = 5;

    [Column("status")]
    public string Status { get; set; } = "active";

    [Column("description")]
    public string? Description { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navegación
    [ForeignKey("CategoryId")]
    public Category? Category { get; set; }

    public ICollection<StockMovement> Movements { get; set; } = [];

    // Lógica de negocio: calcula el estado según el stock
    public void RecalculateStatus()
    {
        Status = Stock == 0 ? "out_of_stock"
               : Stock <= MinStock ? "low_stock"
               : "active";
    }
}
