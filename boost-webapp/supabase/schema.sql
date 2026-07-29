-- ============================================================
-- BOOST — Esquema de base de datos
-- Ejecutar completo en Supabase: Panel > SQL Editor > New query > pegar y correr
-- ============================================================

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  emoji text default '⭐',
  name text not null,
  owner text default '',
  plan text default '',
  status text default 'Activo' check (status in ('Activo','Pausa')),
  created_at timestamptz default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  title text default 'Nueva publicación',
  type text default 'Carrusel' check (type in ('Carrusel','Reel','Historia','Estatico')),
  post_date date not null,
  status text default 'Idea' check (status in ('Idea','En diseño','A aprobar','Programado','Publicado')),
  platforms text[] default '{}',
  links text default '',
  objective text default '',
  caption text default '',
  notes text default '',
  script text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists slides (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  position int default 0,
  title text default '',
  subtitle text default '',
  keywords text default ''
);

create table if not exists ejes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  month text not null, -- formato 'YYYY-MM'
  content text default '',
  unique(client_id, month)
);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz default now()
);

-- ============================================================
-- Seguridad: solo usuarios logueados del equipo pueden ver y editar todo.
-- (Herramienta interna, no multi-cliente-externo: cualquier persona invitada
-- por vos en Supabase Authentication puede acceder a todas las cuentas.)
-- ============================================================
alter table clients enable row level security;
alter table posts enable row level security;
alter table slides enable row level security;
alter table ejes enable row level security;
alter table profiles enable row level security;

create policy "team can read clients" on clients for select using (auth.role() = 'authenticated');
create policy "team can write clients" on clients for insert with check (auth.role() = 'authenticated');
create policy "team can update clients" on clients for update using (auth.role() = 'authenticated');
create policy "team can delete clients" on clients for delete using (auth.role() = 'authenticated');

create policy "team can read posts" on posts for select using (auth.role() = 'authenticated');
create policy "team can write posts" on posts for insert with check (auth.role() = 'authenticated');
create policy "team can update posts" on posts for update using (auth.role() = 'authenticated');
create policy "team can delete posts" on posts for delete using (auth.role() = 'authenticated');

create policy "team can read slides" on slides for select using (auth.role() = 'authenticated');
create policy "team can write slides" on slides for insert with check (auth.role() = 'authenticated');
create policy "team can update slides" on slides for update using (auth.role() = 'authenticated');
create policy "team can delete slides" on slides for delete using (auth.role() = 'authenticated');

create policy "team can read ejes" on ejes for select using (auth.role() = 'authenticated');
create policy "team can write ejes" on ejes for insert with check (auth.role() = 'authenticated');
create policy "team can update ejes" on ejes for update using (auth.role() = 'authenticated');
create policy "team can delete ejes" on ejes for delete using (auth.role() = 'authenticated');

create policy "users can read own profile" on profiles for select using (auth.uid() = id);
