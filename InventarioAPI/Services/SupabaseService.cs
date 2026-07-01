using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using InventarioAPI.Models;

namespace InventarioAPI.Services;

// ─── DTOs con nombres snake_case de Supabase ─────────────────────────────────

public record SbCategory(
    [property: JsonPropertyName("id")] Guid Id,
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("color")] string Color,
    [property: JsonPropertyName("created_at")] DateTime CreatedAt
);

public record SbProduct(
    [property: JsonPropertyName("id")] Guid Id,
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("sku")] string Sku,
    [property: JsonPropertyName("category_id")] Guid CategoryId,
    [property: JsonPropertyName("price")] decimal Price,
    [property: JsonPropertyName("stock")] int Stock,
    [property: JsonPropertyName("min_stock")] int MinStock,
    [property: JsonPropertyName("status")] string Status,
    [property: JsonPropertyName("description")] string? Description,
    [property: JsonPropertyName("updated_at")] DateTime UpdatedAt
);

public record SbMovement(
    [property: JsonPropertyName("id")] Guid Id,
    [property: JsonPropertyName("product_id")] Guid ProductId,
    [property: JsonPropertyName("movement_type")] string MovementType,
    [property: JsonPropertyName("quantity")] int Quantity,
    [property: JsonPropertyName("reference")] string? Reference,
    [property: JsonPropertyName("created_at")] DateTime CreatedAt
);

// ─── Cliente HTTP para Supabase REST ─────────────────────────────────────────

public class SupabaseService
{
    private readonly HttpClient _http;

    private static readonly JsonSerializerOptions _opts = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public SupabaseService(IConfiguration config)
    {
        var url = config["Supabase:Url"]!.TrimEnd('/');
        var key = config["Supabase:AnonKey"]!;

        _http = new HttpClient { BaseAddress = new Uri($"{url}/rest/v1/") };
        _http.DefaultRequestHeaders.Add("apikey", key);
        _http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", key);
        _http.DefaultRequestHeaders.Add("Prefer", "return=representation");
    }

    // ── Categories ────────────────────────────────────────────────────────────

    public async Task<List<SbCategory>> GetCategoriesAsync()
    {
        var res = await _http.GetAsync("categories?select=id,name,color,created_at&order=name");
        res.EnsureSuccessStatusCode();
        var json = await res.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<List<SbCategory>>(json, _opts)!;
    }

    public async Task<SbCategory?> GetCategoryAsync(Guid id)
    {
        var res = await _http.GetAsync($"categories?id=eq.{id}&select=id,name,color,created_at");
        res.EnsureSuccessStatusCode();
        var json = await res.Content.ReadAsStringAsync();
        var list = JsonSerializer.Deserialize<List<SbCategory>>(json, _opts)!;
        return list.FirstOrDefault();
    }

    public async Task<SbCategory> CreateCategoryAsync(Category input)
    {
        var body = JsonSerializer.Serialize(new { name = input.Name, color = input.Color });
        var res = await _http.PostAsync("categories", new StringContent(body, Encoding.UTF8, "application/json"));
        res.EnsureSuccessStatusCode();
        var json = await res.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<List<SbCategory>>(json, _opts)!.First();
    }

    public async Task<SbCategory?> UpdateCategoryAsync(Guid id, Category input)
    {
        var body = JsonSerializer.Serialize(new { name = input.Name, color = input.Color });
        var req = new HttpRequestMessage(HttpMethod.Patch, $"categories?id=eq.{id}")
        {
            Content = new StringContent(body, Encoding.UTF8, "application/json")
        };
        var res = await _http.SendAsync(req);
        res.EnsureSuccessStatusCode();
        var json = await res.Content.ReadAsStringAsync();
        var list = JsonSerializer.Deserialize<List<SbCategory>>(json, _opts)!;
        return list.FirstOrDefault();
    }

    public async Task DeleteCategoryAsync(Guid id)
    {
        var res = await _http.DeleteAsync($"categories?id=eq.{id}");
        res.EnsureSuccessStatusCode();
    }

    // ── Products ──────────────────────────────────────────────────────────────

    public async Task<List<SbProduct>> GetProductsAsync(string? q, string? category, string? status)
    {
        var filters = new List<string> { "select=id,name,sku,category_id,price,stock,min_stock,status,description,updated_at", "order=name" };

        if (!string.IsNullOrWhiteSpace(category)) filters.Add($"category_id=eq.{category}");
        if (!string.IsNullOrWhiteSpace(status)) filters.Add($"status=eq.{status}");
        if (!string.IsNullOrWhiteSpace(q))
        {
            // PostgREST OR filter
            filters.Add($"or=(name.ilike.*{Uri.EscapeDataString(q)}*,sku.ilike.*{Uri.EscapeDataString(q)}*)");
        }

        var res = await _http.GetAsync($"products?{string.Join("&", filters)}");
        res.EnsureSuccessStatusCode();
        var json = await res.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<List<SbProduct>>(json, _opts)!;
    }

    public async Task<SbProduct?> GetProductAsync(Guid id)
    {
        var res = await _http.GetAsync($"products?id=eq.{id}&select=id,name,sku,category_id,price,stock,min_stock,status,description,updated_at");
        res.EnsureSuccessStatusCode();
        var json = await res.Content.ReadAsStringAsync();
        var list = JsonSerializer.Deserialize<List<SbProduct>>(json, _opts)!;
        return list.FirstOrDefault();
    }

    public async Task<(SbProduct? product, bool duplicateSku)> CreateProductAsync(Product input)
    {
        var body = JsonSerializer.Serialize(new
        {
            name = input.Name,
            sku = input.Sku,
            category_id = input.CategoryId,
            price = input.Price,
            stock = input.Stock,
            min_stock = input.MinStock,
            status = CalculateStatus(input.Stock, input.MinStock),
            description = input.Description,
        });

        var res = await _http.PostAsync("products", new StringContent(body, Encoding.UTF8, "application/json"));

        if (res.StatusCode == System.Net.HttpStatusCode.Conflict) return (null, true);
        res.EnsureSuccessStatusCode();

        var json = await res.Content.ReadAsStringAsync();
        return (JsonSerializer.Deserialize<List<SbProduct>>(json, _opts)!.First(), false);
    }

    public async Task<(SbProduct? product, bool duplicateSku)> UpdateProductAsync(Guid id, Product input)
    {
        var body = JsonSerializer.Serialize(new
        {
            name = input.Name,
            sku = input.Sku,
            category_id = input.CategoryId,
            price = input.Price,
            stock = input.Stock,
            min_stock = input.MinStock,
            status = CalculateStatus(input.Stock, input.MinStock),
            description = input.Description,
            updated_at = DateTime.UtcNow,
        });

        var req = new HttpRequestMessage(HttpMethod.Patch, $"products?id=eq.{id}")
        {
            Content = new StringContent(body, Encoding.UTF8, "application/json")
        };
        var res = await _http.SendAsync(req);

        if (res.StatusCode == System.Net.HttpStatusCode.Conflict) return (null, true);
        res.EnsureSuccessStatusCode();

        var json = await res.Content.ReadAsStringAsync();
        var list = JsonSerializer.Deserialize<List<SbProduct>>(json, _opts)!;
        return (list.FirstOrDefault(), false);
    }

    public async Task DeleteProductAsync(Guid id)
    {
        var res = await _http.DeleteAsync($"products?id=eq.{id}");
        res.EnsureSuccessStatusCode();
    }

    // ── Movements ─────────────────────────────────────────────────────────────

    public async Task<List<SbMovement>> GetMovementsAsync(Guid productId)
    {
        var res = await _http.GetAsync(
            $"stock_movements?product_id=eq.{productId}&select=id,product_id,movement_type,quantity,reference,created_at&order=created_at.desc&limit=20");
        res.EnsureSuccessStatusCode();
        var json = await res.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<List<SbMovement>>(json, _opts)!;
    }

    public async Task<List<SbMovement>> GetAllMovementsAsync(Guid? productId)
    {
        var filter = productId.HasValue ? $"product_id=eq.{productId}&" : "";
        var res = await _http.GetAsync(
            $"stock_movements?{filter}select=id,product_id,movement_type,quantity,reference,created_at&order=created_at.desc&limit=50");
        res.EnsureSuccessStatusCode();
        var json = await res.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<List<SbMovement>>(json, _opts)!;
    }

    public async Task<(SbMovement? movement, string? error)> CreateMovementAsync(StockMovement input)
    {
        // 1. Obtener stock actual
        var product = await GetProductAsync(input.ProductId);
        if (product is null) return (null, "Producto no encontrado.");
        if (input.Quantity <= 0) return (null, "La cantidad debe ser mayor a cero.");

        int newStock = input.MovementType switch
        {
            "in" => product.Stock + input.Quantity,
            "out" => product.Stock - input.Quantity,
            "adjustment" => input.Quantity,
            _ => product.Stock
        };

        if (newStock < 0) return (null, "El stock no puede quedar negativo.");

        // 2. Registrar el movimiento
        var movBody = JsonSerializer.Serialize(new
        {
            product_id = input.ProductId,
            movement_type = input.MovementType,
            quantity = input.Quantity,
            reference = input.Reference,
        });
        var movRes = await _http.PostAsync("stock_movements", new StringContent(movBody, Encoding.UTF8, "application/json"));
        movRes.EnsureSuccessStatusCode();

        // 3. Actualizar stock del producto
        var stockBody = JsonSerializer.Serialize(new
        {
            stock = newStock,
            status = CalculateStatus(newStock, product.MinStock),
            updated_at = DateTime.UtcNow,
        });
        var req = new HttpRequestMessage(HttpMethod.Patch, $"products?id=eq.{input.ProductId}")
        {
            Content = new StringContent(stockBody, Encoding.UTF8, "application/json")
        };
        await _http.SendAsync(req);

        var json = await movRes.Content.ReadAsStringAsync();
        return (JsonSerializer.Deserialize<List<SbMovement>>(json, _opts)!.First(), null);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static string CalculateStatus(int stock, int minStock) =>
        stock == 0 ? "out_of_stock" : stock <= minStock ? "low_stock" : "active";
}
