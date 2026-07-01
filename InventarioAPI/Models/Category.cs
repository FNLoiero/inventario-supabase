using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InventarioAPI.Models;

[Table("categories")]
public class Category
{
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("color")]
    public string Color { get; set; } = "#5a6787";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navegación
    public ICollection<Product> Products { get; set; } = [];
}
