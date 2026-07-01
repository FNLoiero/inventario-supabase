using Microsoft.EntityFrameworkCore;
using InventarioAPI.Models;

namespace InventarioAPI.Data;

public class InventarioContext(DbContextOptions<InventarioContext> options) : DbContext(options)
{
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // UUID defaults generados en la BD
        modelBuilder.Entity<Category>()
            .Property(c => c.Id)
            .HasDefaultValueSql("gen_random_uuid()");

        modelBuilder.Entity<Product>()
            .Property(p => p.Id)
            .HasDefaultValueSql("gen_random_uuid()");

        modelBuilder.Entity<Product>()
            .Property(p => p.UpdatedAt)
            .HasDefaultValueSql("now()");

        modelBuilder.Entity<StockMovement>()
            .Property(m => m.Id)
            .HasDefaultValueSql("gen_random_uuid()");

        // SKU único
        modelBuilder.Entity<Product>()
            .HasIndex(p => p.Sku)
            .IsUnique();

        // Relaciones
        modelBuilder.Entity<Product>()
            .HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<StockMovement>()
            .HasOne(m => m.Product)
            .WithMany(p => p.Movements)
            .HasForeignKey(m => m.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
