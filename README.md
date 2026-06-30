# Inventario — Stock Tracker MVP

MVP de gestión de inventario para el challenge técnico de Software Engineer Web en AranguriApps. La app permite ver el estado del stock, crear y editar productos, filtrar por categoría y revisar movimientos.

**Demo en producción:** [inventario-supabase.vercel.app](https://inventario-supabase.vercel.app)

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Estilos | Tailwind CSS v3 con design tokens propios |
| BaaS / DB | Supabase (Postgres + Auth) |
| Formularios | React Hook Form + Zod |
| Tests | Vitest + Testing Library |
| Deploy | Vercel |

---

## Pantallas

- **Login** — Autenticación con email y contraseña vía Supabase Auth. Todas las rutas están protegidas por middleware.
- **Dashboard** — KPIs: total de productos, stock bajo, sin stock, unidades totales y resumen de stock por producto.
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

# 4. Creá un usuario en Supabase
# Authentication → Users → Add user

# 5. Corré en desarrollo
npm run dev

# 6. Tests
npm test
```

Sin variables de entorno configuradas, la app funciona en **modo demo** con datos semilla — no crashea, solo no persiste cambios ni requiere login.

---

## Estructura

```
src/
  app/
    login/
      page.tsx               # Pantalla de login
      actions.ts             # signIn / signOut server actions
    page.tsx                 # Dashboard
    products/
      page.tsx               # Listado con búsqueda y filtros
      new/page.tsx           # Alta de producto
      [id]/
        page.tsx             # Detalle
        edit/page.tsx        # Edición
  components/
    app-shell.tsx            # Layout + nav + botón de logout
    inventory-dashboard.tsx  # Dashboard con KPIs
    product-form.tsx         # Formulario RHF + Zod (cliente)
    search-bar.tsx           # Input de búsqueda + chips de categoría (cliente)
  lib/
    inventory.ts             # Tipos, datos semilla y helpers
    schemas.ts               # Schema Zod compartido entre cliente y servidor
    actions.ts               # Server actions: CRUD de productos y queries
    supabase.ts              # Cliente Supabase browser
    supabase-server.ts       # Cliente Supabase server (con cookies para Auth)
  middleware.ts              # Protección de rutas — redirige a /login si no hay sesión
  __tests__/
    schemas.test.ts          # Validación del schema Zod
    inventory.test.ts        # Helpers de inventario

supabase/schema.sql          # DDL de tablas (categories, products, stock_movements)
```

---

## Decisiones técnicas

**Autenticación con Supabase Auth.** El middleware de Next.js verifica la sesión en cada request usando `@supabase/ssr`. Si no hay usuario autenticado, redirige a `/login`. El cliente server-side usa cookies para mantener la sesión entre requests, siguiendo el patrón recomendado por Supabase para App Router.

**Demo mode vs. Supabase real.** El cliente Supabase devuelve `null` si las env vars no están configuradas. Las server actions verifican esto y en modo demo simplemente redirigen sin persistir. Permite que evaluadores vean la UI sin configurar nada.

**Filtrado por URL params.** La página de productos es un Server Component que recibe `searchParams` y filtra los datos. El `SearchBar` (client component) actualiza la URL con `useRouter`, sin estado local. Los filtros son bookmarkeables y el servidor hace el trabajo pesado.

**Schema Zod en `lib/schemas.ts`.** El mismo schema valida en el cliente (RHF resolver) y en la server action. Evita duplicar reglas y garantiza que ningún dato inválido llegue a la base de datos aunque se saltee la validación del browser.

**`useTransition` en el formulario.** React 19 permite llamar server actions desde componentes cliente con `startTransition`. El botón de submit muestra "Guardando…" mientras la acción está pendiente. Los errores del servidor (ej: SKU duplicado) se capturan y muestran en el formulario sin recargar la página.

**Design system propio.** Se definió una paleta `ink` (gris oscuro), `coral` (acento), `mint` (positivo) y `gold` (alerta) en `tailwind.config.ts`. Evita que la UI se vea genérica sin necesitar una librería de componentes.

**`notFound()` en rutas dinámicas.** Las páginas de detalle y edición llaman `notFound()` si el ID no existe, en lugar de mostrar datos vacíos o fallar silenciosamente.

**Tests sobre lógica pura.** Los tests cubren el schema Zod y los helpers de inventario — los casos más críticos y más fáciles de testear sin mocks complejos.

---

## Lo que quedó fuera del MVP

- Multiusuario con roles (solo hay un usuario administrador).
- Importación/exportación masiva (CSV).
- Reportes avanzados con gráficos.
- Webhooks o integraciones externas.

---

## Uso de IA

El scaffolding inicial (estructura de carpetas, design tokens de Tailwind, tipos de datos, datos semilla y layout principal) fue generado con asistencia de Claude (Anthropic). Las siguientes partes fueron completadas, revisadas y ajustadas en iteración directa:

- Autenticación con `@supabase/ssr` y middleware de protección de rutas
- Client/server split del formulario con `useTransition` + server actions
- Manejo de errores del servidor en el formulario (SKU duplicado, errores de Supabase)
- Lógica de filtrado por URL params con `Suspense` boundary para `useSearchParams`
- Conexión de todas las páginas a Supabase (lecturas y escrituras)
- Tests de schema y helpers con Vitest

Todo el código fue leído, entendido y validado antes de integrarse.
