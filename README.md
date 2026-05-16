# Atas Sacramentais

Sistema web para criação, gestão e impressão de atas de reunião sacramental de unidades da Igreja SUD.

## Stack

- **Next.js 14** (App Router)
- **Supabase** (PostgreSQL + Auth + RLS)
- **Tailwind CSS**
- **React Query** (TanStack Query v5)
- **Zod** + **React Hook Form**
- **TypeScript** (strict)

## Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas credenciais do Supabase:

- Acesse [supabase.com](https://supabase.com) → seu projeto → Settings → API
- Copie `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- Copie `publishable` → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Copie `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (**nunca exponha no frontend**)

### 3. Rodar as migrations

```bash
# Instale o Supabase CLI via npm se ainda não tiver
npm install -g supabase

# Caso o npm não funcione, use o scoop. 
# 1. Instalar o Scoop (se não tiver):
irm get.scoop.sh | iex

# 2. Instalar o Supabase CLI:
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Rode as migrations no seu projeto remoto
supabase db push --project-ref SEU_PROJECT_REF

# Ou via SQL Editor no dashboard do Supabase:
# Cole o conteúdo de supabase/migrations/001_initial_schema.sql
```

### 4. Configurar Google OAuth no Supabase

1. No Supabase dashboard → Authentication → Providers → Google
2. Ative e configure com suas credenciais do Google Cloud Console
3. Adicione a URL de callback: `https://SEU_PROJETO.supabase.co/auth/v1/callback`
4. No Google Cloud Console → APIs & Services → Credentials → OAuth 2.0
   - Authorized redirect URIs: `https://SEU_PROJETO.supabase.co/auth/v1/callback`

### 5. Criar o primeiro adm manualmente

Após o primeiro login com Google, acesse o Supabase dashboard → Table Editor → `users`:
- Mude o `role` do seu usuário de `reader` para `adm`
- Vincule-o a uma ala em `ala_id`

### 6. Rodar seed (opcional — cria dados de exemplo)

```bash
# Via Supabase SQL Editor:
# Cole o conteúdo de supabase/seeds/001_modelo_padrao.sql
```

### 7. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

---

## Estrutura do projeto

```
src/
├── app/
│   ├── (auth)/login/          # Tela de login (Google OAuth)
│   ├── (app)/                 # Layout autenticado
│   │   ├── dashboard/         # Página inicial
│   │   ├── atas/              # Lista, criar, visualizar, editar, imprimir
│   │   ├── modelos/           # Gestão de modelos (adm)
│   │   └── admin/             # Usuários e unidades (adm)
│   └── api/
│       └── auth/callback/     # Callback OAuth do Supabase
│
├── components/
│   ├── ui/                    # Componentes base (Button, Input, etc.)
│   ├── layout/                # AppShell, Header, Sidebar
│   └── providers/             # React Query, etc.
│
├── features/                  # Lógica por domínio
│   ├── auth/
│   ├── atas/
│   ├── modelos/
│   └── admin/
│
├── lib/
│   ├── supabase/              # Clientes (browser, server, middleware)
│   ├── permissions.ts         # Regras de negócio de acesso
│   ├── schemas.ts             # Validações Zod
│   └── utils.ts               # Helpers gerais
│
├── types/
│   ├── domain.ts              # Tipos do domínio (Ata, User, Ala, etc.)
│   └── supabase.ts            # Tipos gerados pelo Supabase CLI
│
└── middleware.ts              # Proteção de rotas
```

## Fases de desenvolvimento

- **Fase 1 — MVP** *(atual)*: Setup, autenticação, CRUD de atas, impressão
- **Fase 2 — Acesso**: Middleware por role, painel admin
- **Fase 3 — Modelos**: Interface de criação de modelos configuráveis
- **Fase 4 — Polimento**: PDF, histórico, notificações, mobile

## Scripts

```bash
npm run dev           # Servidor de desenvolvimento
npm run build         # Build de produção
npm run type-check    # Verificação de tipos TypeScript
npm run lint          # ESLint
npm run test          # Vitest
npm run db:generate   # Gera tipos TypeScript do banco (supabase/types)
```
