# Inventario — Stock Tracker MVP

MVP de gestión de inventario para el challenge técnico de Software Engineer Web en AranguriApps. La app permite ver el estado del stock, crear y editar productos, filtrar por categoría y revisar movimientos.

**Demo en producción:** [inventario-supabase.vercel.app](https://inventario-supabase.vercel.app)

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Estilos | Tailwind CSS v3 con design tokens propios |
| Backend API | .NET 10 Web API (ASP.NET Core + Supabase REST) |
| BaaS / DB | Supabase (Postgres + Auth) |
| Formularios | React Hook Form + Zod |
| Tests | Vitest + Testing Library |
| Deploy | Vercel |

---

## Pantallas

- **Login** — Autenticación con email y contraseña vía Supabase Auth. Todas las rutas están protegidas por proxy (middleware).
- **Dashboard** — KPIs: total de productos, stock bajo, sin stock, unidades totales y resumen de stock por producto.
- **Listado de productos** — Búsqueda por nombre/SKU y filtro por categoría vía URL params (`?q=&category=`). Stock colorizado según criticidad.
- **Detalle de producto** — Metadata completa + historial de movimientos con etiquetas en color (entrada / salida / ajuste).
- **Nuevo / Editar producto** — Formulario con validación en el cliente (RHF + Zod) y server action para persistir.

---

## Arrancar el proyecto

### Frontend (Next.js) — producción en Vercel

```bash
cd inventario-supabase
npm install

# Configurá variables de entorno
cp .env.example .env.local
# Completá NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY

# Ejecutá supabase/schema.sql en el SQL editor de tu proyecto Supabase
# Creá un usuario en Authentication → Users → Add user

npm run dev   # http://localhost:3000
npm test
```

### Backend (.NET 10 Web API) — demo local opcional

La .NET API es una capa REST alternativa que se puede correr localmente para ver la arquitectura completa. En producción (Vercel) el frontend llama directamente a Supabase.

```bash
cd InventarioAPI

# Configurá appsettings.json con tu URL y anon key de Supabase
dotnet run
# API disponible en http://localhost:5179
```

Para que el frontend Next.js use la .NET API en lugar de Supabase directo, agregá al `.env.local`:

```
INVENTARIO_API_URL=http://localhost:5179
```

Sin esa variable, el frontend usa Supabase. **Ambas opciones apuntan al mismo Postgres** — el esquema es idéntico.

> **Nota de red:** Supabase usa IPv6 para conexiones directas a Postgres. La .NET API fue implementada usando el REST API de Supabase por HTTP para evitar esta limitación, lo que hace que funcione en cualquier red.

---

## Estructura

```
inventario-supabase/         # Frontend Next.js
  src/
    app/
      login/
        page.tsx             # Pantalla de login
        actions.ts           # signIn / signOut server actions
      page.tsx               # Dashboard
      products/
        page.tsx             # Listado con búsqueda y filtros
        new/page.tsx         # Alta de producto
        [id]/
          page.tsx           # Detalle
          edit/page.tsx      # Edición
    components/
      app-shell.tsx          # Layout + nav + botón de logout
      inventory-dashboard.tsx
      product-form.tsx       # Formulario RHF + Zod (cliente)
      search-bar.tsx         # Input de búsqueda + chips de categoría
    lib/
      inventory.ts           # Tipos, datos semilla y helpers
      schemas.ts             # Schema Zod compartido cliente/servidor
      actions.ts             # Server actions: .NET API → Supabase → mock (en ese orden)
      supabase.ts            # Cliente Supabase browser
      supabase-server.ts     # Cliente Supabase server (cookies para Auth)
    proxy.ts                 # Protección de rutas (Next.js 16)
    __tests__/
      schemas.test.ts
      inventory.test.ts

InventarioAPI/               # Backend .NET 10 Web API
  Controllers/
    CategoriesController.cs  # GET, POST, PUT, DELETE /api/categories
    ProductsController.cs    # CRUD + filtros ?q=&category=&status= + /movements
    MovementsController.cs   # POST /api/movements (actualiza stock automáticamente)
  Services/
    SupabaseService.cs       # Cliente HTTP para Supabase REST API
  Models/
    Category.cs
    Product.cs               # RecalculateStatus() calcula estado según stock
    StockMovement.cs
  Data/
    InventarioContext.cs     # EF Core DbContext (referencia de esquema)
  Program.cs                 # CORS, SupabaseService singleton, controllers

supabase/schema.sql          # DDL: categories, products, stock_movements + RLS
```

---

## Decisiones técnicas

**Arquitectura de doble backend.** El frontend soporta dos fuentes de datos en `lib/actions.ts`: si `INVENTARIO_API_URL` está definida llama a la .NET Web API; si no, llama a Supabase directamente. Esto permite demostrar una arquitectura profesional con API REST dedicada, sin sacrificar el deploy en Vercel donde no hay servidor .NET disponible.

**.NET API sobre Supabase REST.** La .NET Web API consume el REST API de Supabase vía HTTP en lugar de conectarse directamente a Postgres. Esta decisión evita la limitación de IPv6 que tienen las conexiones directas de Supabase y hace que el API funcione en cualquier red sin configuración adicional. El `SupabaseService` maneja toda la lógica: mapeo de snake_case, filtros PostgREST, y actualización atómica del stock al registrar movimientos.

**Autenticación con Supabase Auth.** El proxy de Next.js 16 verifica la sesión en cada request usando `@supabase/ssr`. Si no hay usuario autenticado, redirige a `/login`. El cliente server-side usa cookies para mantener la sesión.

**Filtrado por URL params.** La página de productos es un Server Component que recibe `searchParams` y filtra en el servidor. El `SearchBar` (client component) actualiza la URL con `useRouter`. Los filtros son bookmarkeables y no requieren estado local.

**Schema Zod compartido.** El mismo schema en `lib/schemas.ts` valida en el cliente (RHF resolver) y en las server actions. Garantiza que ningún dato inválido llegue al backend aunque se saltee la validación del browser.

**`useTransition` en el formulario.** Permite llamar server actions desde componentes cliente mostrando estado de carga. Los errores del servidor (SKU duplicado, etc.) se capturan y muestran en el formulario sin recargar la página.

**Design system propio.** Paleta `ink` (gris oscuro), `coral` (acento), `mint` (positivo) y `gold` (alerta) definida en `tailwind.config.ts`. La UI tiene identidad visual sin depender de una librería de componentes.

**`notFound()` en rutas dinámicas.** Las páginas de detalle y edición llaman `notFound()` si el ID no existe, en lugar de mostrar datos vacíos o crashear.

**Tests sobre lógica pura.** Los tests cubren el schema Zod y los helpers de inventario — los casos más críticos y más fáciles de testear sin mocks complejos.

---

## Lo que quedó fuera del MVP

- Multiusuario con roles (solo hay un usuario administrador).
- Importación/exportación masiva (CSV).
- Reportes avanzados con gráficos.
- Webhooks o integraciones externas.
- Deploy de la .NET API (requeriría un servidor o servicio como Railway/Fly.io).

---

## Uso de IA

El scaffolding inicial y parte del código fue generado con asistencia de Claude (Anthropic). Las siguientes partes fueron desarrolladas, revisadas y ajustadas en iteración directa:

- Autenticación con `@supabase/ssr` y protección de rutas
- Client/server split del formulario con `useTransition` + server actions
- Manejo de errores del servidor en el formulario (SKU duplicado, validaciones)
- Filtrado por URL params con `Suspense` boundary para `useSearchParams`
- Conexión de todas las páginas a Supabase (lecturas y escrituras)
- .NET 10 Web API con `SupabaseService` HTTP client y tres controllers REST
- Arquitectura de doble fuente de datos en `actions.ts`
- Tests de schema y helpers con Vitest

Todo el código fue leído, entendido y validado antes de integrarse.
