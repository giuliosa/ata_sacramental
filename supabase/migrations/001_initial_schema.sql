-- ============================================================
-- Migration: 001_initial_schema
-- Descrição: Schema inicial do sistema de atas sacramentais
-- ============================================================

-- Extensões necessárias
create extension if not exists "uuid-ossp";

-- ─── Enum de roles ────────────────────────────────────────────────────────────

create type user_role as enum ('adm', 'editor', 'reader');

-- ─── Estacas ─────────────────────────────────────────────────────────────────

create table estacas (
  id         uuid primary key default uuid_generate_v4(),
  nome       text not null unique,
  created_at timestamptz not null default now()
);

comment on table estacas is 'Unidades de estaca da Igreja SUD';

-- ─── Alas ────────────────────────────────────────────────────────────────────

create table alas (
  id         uuid primary key default uuid_generate_v4(),
  nome       text not null,
  estaca_id  uuid not null references estacas(id) on delete restrict,
  created_at timestamptz not null default now(),

  -- Mesma ala não pode existir duas vezes na mesma estaca (case-insensitive via índice)
  constraint uq_ala_nome_estaca unique (nome, estaca_id)
);

comment on table alas is 'Alas vinculadas a uma estaca';

-- Índice para busca case-insensitive ao cadastrar nova ala
create index idx_alas_nome_lower on alas (lower(nome), estaca_id);

-- ─── Users (espelha auth.users do Supabase) ──────────────────────────────────

create table users (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null unique,
  name       text not null,
  role       user_role not null default 'reader',
  ala_id     uuid references alas(id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table users is 'Perfil dos usuários — espelha auth.users';

-- ─── Modelos ─────────────────────────────────────────────────────────────────

create table modelos (
  id         uuid primary key default uuid_generate_v4(),
  nome       text not null,
  conteudo   jsonb not null default '{}',
  criado_por uuid not null references users(id) on delete restrict,
  ativo      boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table modelos is 'Modelos de ata configuráveis por adm';

-- ─── Atas ────────────────────────────────────────────────────────────────────

create table atas (
  id           uuid primary key default uuid_generate_v4(),
  data_reuniao date not null,
  ala_id       uuid not null references alas(id) on delete restrict,
  modelo_id    uuid not null references modelos(id) on delete restrict,
  conteudo     jsonb not null default '{}',
  criado_por   uuid not null references users(id) on delete restrict,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  -- Cada ala só pode ter uma ata por data
  constraint uq_ata_ala_data unique (ala_id, data_reuniao)
);

comment on table atas is 'Atas de reunião sacramental';

-- Índice para listagem de atas por ala ordenada por data
create index idx_atas_ala_data on atas (ala_id, data_reuniao desc);

-- Trigger: atualiza updated_at automaticamente
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_atas_updated_at
  before update on atas
  for each row execute function update_updated_at();

-- ─── Row Level Security (RLS) ─────────────────────────────────────────────────

-- Habilita RLS em todas as tabelas
alter table estacas enable row level security;
alter table alas    enable row level security;
alter table users   enable row level security;
alter table modelos enable row level security;
alter table atas    enable row level security;

-- Helper: retorna o role do usuário autenticado
create or replace function get_user_role()
returns user_role as $$
  select role from users where id = auth.uid()
$$ language sql security definer stable;

-- Helper: retorna a ala_id do usuário autenticado
create or replace function get_user_ala_id()
returns uuid as $$
  select ala_id from users where id = auth.uid()
$$ language sql security definer stable;

-- Estacas: leitura pública para autenticados
create policy "Autenticados podem ver estacas"
  on estacas for select
  to authenticated
  using (true);

create policy "Apenas adm pode gerenciar estacas"
  on estacas for all
  to authenticated
  using (get_user_role() = 'adm')
  with check (get_user_role() = 'adm');

-- Alas: leitura pública para autenticados
create policy "Autenticados podem ver alas"
  on alas for select
  to authenticated
  using (true);

create policy "Apenas adm pode gerenciar alas"
  on alas for all
  to authenticated
  using (get_user_role() = 'adm')
  with check (get_user_role() = 'adm');

-- Users: cada um vê o próprio perfil; adm vê todos
create policy "Usuário vê próprio perfil"
  on users for select
  to authenticated
  using (id = auth.uid() or get_user_role() = 'adm');

create policy "Usuário atualiza próprio perfil"
  on users for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Adm gerencia todos os usuários"
  on users for all
  to authenticated
  using (get_user_role() = 'adm')
  with check (get_user_role() = 'adm');

-- Modelos: leitura para autenticados; escrita apenas adm
create policy "Autenticados podem ver modelos ativos"
  on modelos for select
  to authenticated
  using (ativo = true or get_user_role() = 'adm');

create policy "Apenas adm gerencia modelos"
  on modelos for all
  to authenticated
  using (get_user_role() = 'adm')
  with check (get_user_role() = 'adm');

-- Atas: usuário só vê atas da própria ala
create policy "Usuário vê atas da própria ala"
  on atas for select
  to authenticated
  using (ala_id = get_user_ala_id());

create policy "Editor e adm podem criar atas"
  on atas for insert
  to authenticated
  with check (
    ala_id = get_user_ala_id()
    and get_user_role() in ('adm', 'editor')
  );

create policy "Apenas adm pode editar atas"
  on atas for update
  to authenticated
  using (
    ala_id = get_user_ala_id()
    and get_user_role() = 'adm'
  )
  with check (
    ala_id = get_user_ala_id()
    and get_user_role() = 'adm'
  );

create policy "Apenas adm pode excluir atas"
  on atas for delete
  to authenticated
  using (
    ala_id = get_user_ala_id()
    and get_user_role() = 'adm'
  );
