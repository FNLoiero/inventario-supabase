# Inventario — Stock Tracker MVP

MVP de gestión de inventario desarrollado como challenge técnico para AranguriApps. Permite controlar el stock de una tienda o depósito: crear y editar productos, monitorear niveles de stock, recibir alertas de reposición y exportar datos.

**Demo en producción:** [inventario-supabase.vercel.app](https://inventario-supabase.vercel.app)
> Credenciales de acceso disponibles bajo solicitud.

---

## Stack tecnológico

| Capa | Tecnología | Decisión |
|---|---|---|
| Framework | Next.js 16 (App Router) + TypeScript | Server Components, Server Actions, URL params para filtros |
| Estilos | Tailwind CSS v4 + design tokens propios | Paleta personalizada sin librería de componentes |
| Base de datos | Supabase (PostgreSQL + Auth) | BaaS con RLS y autenticación integrada |
| Backend alternativo | .NET 10 Web API (ASP.NET Core) | Capa REST adicional para demostrar arquitectura multicapa |
| Formularios | React Hook Form + Zod | Validación compartida cliente/servidor con el mismo schema |
| Gráficos | Recharts | Gráfico de barras de stock por categoría |
| Tests | Vitest | Tests sobre lógica pura sin mocks de red |
| Deploy | Vercel | CI/CD automático desde GitHub |

---

## Funcionalidades

### Dashboard
- KPIs en tiempo real: total de productos activos, unidades en stock, productos con stock bajo y sin stock
- Alertas de reposición automáticas: chips interactivos por cada producto que alcanzó o superó el mínimo configurado
- Gráfico de barras de stock agrupado por categoría (Recharts)
- Tabla con los últimos 5 productos actualizados
- Los productos archivados quedan excluidos de todas las estadísticas (borrado lógico)

### Listado de productos
- Búsqueda por nombre o SKU
- Filtros por categoría y por estado (Activo / Stock bajo / Sin stock / Archivado)
- Todos los filtros operan sobre URL params: son bookmarkeables y compatibles con navegación browser
- Paginación server-side (10 productos por página)
- Exportación a CSV con BOM para compatibilidad con Excel
- Stock coloreado según criticidad (verde / amarillo / rojo)

### Producto
- Alta y edición con validación completa (nombre, SKU único, categoría, precio, stock, stock mínimo, descripción)
- El estado se calcula automáticamente al guardar: `out_of_stock` si stock = 0, `low_stock` si stock ≤ mínimo, `active` en caso contrario
- Solo es posible forzar manualmente el estado `Archivado`
- Historial de movimientos por producto (entradas, salidas, ajustes)
- Detalle con todos los metadatos

### UX
- Modo oscuro / claro con persistencia en `localStorage` y respeto de preferencia del sistema
- Diseño responsive (mobile-first)
- `notFound()` en rutas dinámicas con ID inválido

---

## Arquitectura

### Frontend → datos
`src/lib/actions.ts` implementa una cadena de prioridad en cada operación:

```
INVENTARIO_API_URL definida  →  .NET Web API
INVENTARIO_API_URL ausente   →  Supabase directo
Sin credenciales             →  datos mock locales
```

Esto permite mostrar la arquitectura completa (.NET API) en local sin afectar el deploy en Vercel (donde no hay servidor .NET disponible).

### Cálculo de estado
El estado del producto no se lee ciegamente de la base de datos. Cada vez que un producto se lee desde Supabase o la .NET API, se recalcula en los mappers (`mapSupabaseProduct`, `mapApiProduct`) usando la función `calcStatus(stock, minStock, current)`. Así, aunque el valor en DB quede desactualizado, la UI siempre muestra el estado correcto.

### Invalidación de caché
Todas las mutaciones (`createProduct`, `updateProduct`, `deleteProduct`) llaman `revalidatePath('/', 'layout')` antes del redirect. Esto invalida el caché de Next.js para todas las rutas del layout, garantizando que el dashboard muestre datos frescos inmediatamente.

### .NET API sobre Supabase REST
La API de .NET consume el REST API de Supabase via HTTP en lugar de conectarse directamente a PostgreSQL. Esta decisión evita la limitación de IPv6 que tienen las conexiones directas de Supabase y permite que la API funcione en cualquier red. El `SupabaseService` maneja el mapeo de snake_case, los filtros PostgREST, y la actualización atómica de stock al registrar movimientos.

### Autenticación
`src/proxy.ts` verifica la sesión Supabase en cada request usando `@supabase/ssr`. Si no hay usuario autenticado, redirige a `/login`. El cliente server-side lee la sesión desde cookies.

---

## Estructura del proyecto

```
inventario-supabase/              # Frontend Next.js
  src/
    app/
      login/
        page.tsx                  # Pantalla de autenticacion
        actions.ts                # signIn / signOut server actions
      page.tsx                    # Dashboard
      products/
        page.tsx                  # Listado con busqueda, filtros y paginacion
        new/page.tsx              # Alta de producto
        [id]/
          page.tsx                # Detalle + historial de movimientos
          edit/page.tsx           # Edicion
    components/
      app-shell.tsx               # Layout principal con nav, logout y toggle de tema
      inventory-dashboard.tsx     # KPIs, alertas, grafico y tablas del dashboard
      product-form.tsx            # Formulario con RHF + Zod
      search-bar.tsx              # Busqueda + chips de categoria y estado
      stock-chart.tsx             # Grafico de barras (Recharts)
      export-button.tsx           # Exportacion a CSV
      pagination.tsx              # Paginacion con URL params
      theme-toggle.tsx            # Toggle modo oscuro/claro
    lib/
      inventory.ts                # Tipos, datos mock y helpers (getInventoryStats, etc.)
      schemas.ts                  # Schema Zod compartido
      actions.ts                  # Server actions: .NET API → Supabase → mock
      supabase.ts                 # Cliente Supabase (browser)
      supabase-server.ts          # Cliente Supabase (server, lee cookies)
    proxy.ts                      # Proteccion de rutas (Next.js 16)
    __tests__/
      schemas.test.ts             # Tests del schema Zod (validacion de campos)
      inventory.test.ts           # Tests de helpers: stats, labels, currency

InventarioAPI/                    # Backend .NET 10 Web API (demo local)
  Controllers/
    CategoriesController.cs       # CRUD /api/categories
    ProductsController.cs         # CRUD + filtros + movimientos
    MovementsController.cs        # POST /api/movements (actualiza stock)
  Services/
    SupabaseService.cs            # HTTP client para Supabase REST API
  Models/
    Product.cs                    # RecalculateStatus() calcula estado segun stock
    Category.cs
    StockMovement.cs
  Data/
    InventarioContext.cs          # EF Core DbContext (referencia de esquema, no usado en runtime)
  Program.cs                      # CORS, DI, controllers

supabase/schema.sql               # DDL: tablas, indices, RLS policies
```

---

## Correr el proyecto localmente

### Requisitos
- Node.js 20+
- Una cuenta de Supabase (gratuita)

### Pasos

```bash
cd inventario-supabase
npm install

# Copiar variables de entorno
cp .env.example .env.local
# Completar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
# con los valores de tu proyecto Supabase (Settings → API)

# Ejecutar supabase/schema.sql en el SQL Editor de Supabase
# Crear un usuario en Authentication → Users → Add user

npm run dev     # http://localhost:3000
npm test        # corre los tests una vez
npm run test:watch  # modo watch interactivo
```

### Backend .NET (opcional)

```bash
cd InventarioAPI
# Verificar que appsettings.json tiene la URL y anon key de Supabase
dotnet run
# API disponible en http://localhost:5179
```

Para que el frontend use la .NET API:
```env
# .env.local
INVENTARIO_API_URL=http://localhost:5179
```

Sin esa variable, el frontend llama directamente a Supabase. Ambas opciones usan el mismo PostgreSQL.

---

## Tests

Los tests son unitarios sobre lógica pura y se corren manualmente:

```bash
npm test           # single pass (para CI o pre-push)
npm run test:watch # modo interactivo durante desarrollo
```

**`schemas.test.ts`** — valida el schema Zod de productos: campos requeridos, tipos, coercion de strings numéricos, enums de estado.

**`inventory.test.ts`** — valida los helpers de `lib/inventory.ts`: cálculo de KPIs excluyendo archivados, labels de estado en español, formateo de moneda ARS.

No hay integración con CI/CD automático. Los tests se ejecutan manualmente antes de cada push relevante.

---

## Decisiones de diseño

**Sin librería de componentes.** La UI usa solo Tailwind CSS con una paleta propia (`ink`, `coral`, `mint`, `gold`). Esto da control total sobre el diseño y demuestra criterio visual sin depender de shadcn/ui o similar.

**Schema Zod compartido.** El mismo `productSchema` valida en el cliente (como resolver de React Hook Form) y en las server actions. Cualquier dato inválido es rechazado en ambas capas.

**`useTransition` en formularios.** Permite llamar server actions desde componentes cliente con estado de carga (`isPending`). Los errores del servidor (ej: SKU duplicado) se capturan y se muestran en el formulario sin recargar la página.

**Filtrado server-side por URL params.** La página de productos es un Server Component que recibe `searchParams`. El `SearchBar` (client component) actualiza la URL con `useRouter`. Los filtros son bookmarkeables y funcionan con el botón Atrás del browser.

**Borrado lógico con `archived`.** Los productos archivados no se eliminan de la base de datos. Quedan excluidos del dashboard, las estadísticas y las alertas, pero siguen visibles en el listado con el filtro de estado.

---

## Fuera del MVP

- Multi-usuario con roles diferenciados
- Importacion/exportacion masiva
- Reportes avanzados (comparativas historicas, tendencias)
- Deploy de la .NET API (requeriria Railway, Fly.io o similar)
- Tests de integracion / end-to-end (Playwright)
- CI/CD automatizado con ejecucion de tests en cada push

---

## Uso de IA

El desarrollo se realizó con asistencia de Claude (Anthropic) durante todo el proceso. Las siguientes partes fueron diseñadas, desarrolladas y ajustadas en iteración directa:

- Autenticación con `@supabase/ssr` y protección de rutas en Next.js 16
- Arquitectura de doble fuente de datos en `actions.ts` (.NET API / Supabase / mock)
- .NET 10 Web API con `SupabaseService` HTTP client y tres controllers REST
- Formulario con `useTransition`, server actions y manejo de errores del servidor
- Filtrado por URL params con boundary `Suspense` para `useSearchParams`
- Sistema de modo oscuro/claro con persistencia en localStorage
- Paginación, exportación CSV, gráfico de stock (Recharts), alertas de reorden
- Cálculo automático de estado por stock (`calcStatus`) en mappers y mutations
- `revalidatePath` en todas las mutations para invalidación de caché correcta
- Tests con Vitest sobre schema y helpers

Todo el código fue revisado, entendido y validado antes de integrarse. Las decisiones de arquitectura (doble backend, borrado lógico, URL params, schema compartido) fueron tomadas y ajustadas por el desarrollador.
