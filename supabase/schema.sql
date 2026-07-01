create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text not null default '#5a6787',
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text not null unique,
  category_id uuid not null references public.categories (id) on delete restrict,
  price numeric(10,2) not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  min_stock integer not null default 5 check (min_stock >= 0),
  status text not null default 'active' check (status in ('active', 'low_stock', 'out_of_stock', 'archived')),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  movement_type text not null check (movement_type in ('in', 'out', 'adjustment')),
  quantity integer not null check (quantity > 0),
  reference text,
  created_at timestamptz not null default now()
);
