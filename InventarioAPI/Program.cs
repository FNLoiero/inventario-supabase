using InventarioAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// Supabase REST service
builder.Services.AddSingleton<SupabaseService>();

// Controllers + JSON camelCase
builder.Services.AddControllers()
    .AddJsonOptions(opts =>
        opts.JsonSerializerOptions.PropertyNamingPolicy =
            System.Text.Json.JsonNamingPolicy.CamelCase);

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

// CORS — permite llamadas desde el frontend Next.js
builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:3000",
                builder.Configuration["AllowedOrigin"] ?? "https://inventario-supabase.vercel.app")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseHttpsRedirection();
app.UseCors("frontend");
app.UseAuthorization();
app.MapControllers();

app.Run();
