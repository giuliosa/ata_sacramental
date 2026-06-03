-- Adiciona updated_at na tabela modelos
alter table modelos add column if not exists updated_at timestamptz not null default now();

-- Cria trigger para modelos
create trigger trg_modelos_updated_at
  before update on modelos
  for each row execute function update_updated_at();

-- Adiciona avatar_url na tabela users
alter table users add column if not exists avatar_url text;
