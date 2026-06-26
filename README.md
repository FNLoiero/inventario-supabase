# Inventario — Stock Tracker MVP

MVP de gestión de inventario para el challenge técnico de Software Engineer Web en AranguriApps. La app permite ver el estado del stock, crear y editar productos, filtrar por categoría y revisar movimientos.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Estilos | Tailwind CSS v3 con design tokens propios |
| BaaS / DB | Supabase (Postgres) |
| Formularios | React Hook Form + Zod |
| Tests | Vitest + Testing Library |
| Deploy | Vercel |

---

## Pantallas

- **Dashboard** — KPIs: total de productos, stock bajo, sin stock, unidades totales, categorías y actividad reciente.
- **Listado de productos** — Búsqueda por nombre/SKU y filtro por categoría vía URL params (`?q=&category=`). Stock colorizado según criticidad.
- **Detalle de producto** — Metadata completa + historial de movimientos con etiquetas en color (entrada / salida / ajuste).
- **Nuevo / Editar producto** — Formulario con validación en el cliente (RHF + Zod) y server action para persistir en Supabase.

---

## Arrancar el proyecto

```bash
# 1. Instalá dependencias
npm install

# 2. Configurá variables de entorno
cp .env.example .env.local
# Completá NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. Creá las tablas en Supabase
# Ejecutá el contenido de supabase/schema.sql en el SQL editor de tu proyecto

# 4. Corré en desarrollo
npm run dev

# 5. Tests
npm test
```

Sin variables de entorno configuradas, la app funciona en **modo demo** con datos semilla — no crashea, solo no persiste cambios.

---

## Estructura

```
src/
  app/
    page.tsx                   # Dashboard
    products/
      page.tsx                 # Listado con búsqueda y filtros
      new/page.tsx             # Alta de producto
      [id]/
        page.tsx               # Detalle
        edit/page.tsx          # Edición
  components/
    app-shell.tsx              # Layout + nav
    inventory-dashboard.tsx    # Dashboard con KPIs
    product-form.tsx           # Formulario RHF + Zod (cliente)
    search-bar.tsx             # Input de búsqueda + chips de categoría (cliente)
  lib/
    inventory.ts               # Tipos, datos semilla y helpers
    schemas.ts                 # Schema Zod compartido entre cliente y servidor
    actions.ts                 # Server actions: create / update / delete / addStockMovement
    supabase.ts                # Cliente Supabase (null si no hay env vars)
  __tests__/
    schemas.test.ts            # Validación del schema Zod
    inventory.test.ts          # Helpers de inventario

supabase/schema.sql            # DDL de tablas (categories, products, stock_movements)
```

---

## Decisiones técnicas

**Demo mode vs. Supabase real.** El cliente Supabase devuelve `null` si las env vars no están configuradas. Las server actions verifican esto y en modo demo simplemente redirigen sin persistir. Esto permite que evaluadores vean la UI sin necesidad de configurar nada.

**Filtrado por URL params.** La página de productos es un Server Component que recibe `searchParams` y filtra los datos. El `SearchBar` (client component) actualiza la URL con `useRouter`, sin estado local. Esto hace que los filtros sean bookmarkeables y funcionen sin JS en la parte del servidor.

**Schema Zod en `lib/schemas.ts`.** El mismo schema valida en el cliente (RHF resolver) y en la server action. Evita duplicar reglas y garantiza consistencia.

**`useTransition` en el formulario.** React 19 permite llamar server actions desde componentes cliente con `startTransition`. El botón de submit muestra "Guardando…" mientras la acción está pendiente, sin necesidad de estado adicional.

**Design system propio.** Se definió una paleta `ink` (gris oscuro), `coral` (acento), `mint` (positivo) y `gold` (alerta) en `tailwind.config.ts`. Evita que la UI se vea genérica sin necesitar una librería de componentes.

**`notFound()` en rutas dinámicas.** Las páginas de detalle y edición llaman `notFound()` si el ID no existe, en lugar de mostrar datos vacíos o fallar silenciosamente.

**Tests sobre lógica pura.** Los tests cubren el schema Zod y los helpers de inventario — los casos más críticos y más fáciles de testear sin mocks complejos. Los componentes se pueden verificar manualmente dada la superficie del MVP.

---

## Lo que quedó fuera del MVP

- Auth (login / sesión) — se puede agregar con Supabase Auth en ~1 día.
- Multiusuario con roles.
- Importación/exportación masiva (CSV).
- Reportes avanzados.
- Webhooks o integraciones externas.

---

## Uso de IA

El scaffolding inicial (estructura de carpetas, design tokens de Tailwind, tipos de datos, datos semilla y layout principal) fue generado con asistencia de Claude (Anthropic). Las siguientes partes fueron completadas, revisadas y ajustadas manualmente o en iteración directa:

- Client/server split del formulario con `useTransition` + server actions
- Lógica de filtrado por URL params con `Suspense` boundary para `useSearchParams`
- Detalle de movimientos con colores semánticos por tipo
- Manejo de modo demo cuando Supabase no está configurado
- Tests de schema y helpers con Vitest

Todo el código fue leído, entendido y validado antes de integrarse.
