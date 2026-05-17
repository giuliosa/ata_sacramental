import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { BookOpen, MapPin, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types/domain'
import { can } from '@/lib/permissions'

export const metadata: Metadata = {
  title: 'Completar cadastro',
}

type UserProfileStatus = {
  ala_id: string | null
  role: UserRole
}

type AlaOption = {
  id: string
  nome: string
  estaca: { nome: string } | null
}

type EstacaOption = {
  id: string
  nome: string
}

async function completeCadastro(formData: FormData) {
  'use server'

  const alaId = formData.get('ala_id')

  if (typeof alaId !== 'string' || !alaId) {
    redirect('/completar-cadastro?error=ala_obrigatoria')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { error } = await supabase
    .from('users')
    .update({ ala_id: alaId } as never)
    .eq('id', user.id)

  if (error) redirect('/completar-cadastro?error=salvar')

  redirect('/dashboard')
}

async function criarAla(formData: FormData) {
  'use server'

  const nome = formData.get('nome')
  const estacaId = formData.get('estaca_id')

  if (typeof nome !== 'string' || !nome.trim()) {
    redirect('/completar-cadastro?action=criar-ala&error=nome_obrigatorio')
  }

  if (typeof estacaId !== 'string' || !estacaId) {
    redirect('/completar-cadastro?action=criar-ala&error=estaca_obrigatoria')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
    .overrideTypes<{ role: UserRole }, { merge: false }>()

  if (!profile || !can.manageUnidades(profile.role)) {
    redirect('/completar-cadastro?error=sem_permissao')
  }

  const { data: existing } = await supabase
    .from('alas')
    .select('id')
    .eq('nome', nome.trim())
    .eq('estaca_id', estacaId)
    .maybeSingle()

  if (existing) {
    redirect('/completar-cadastro?action=criar-ala&error=ala_existente')
  }

  const { data: novaAlaRaw, error } = await supabase
    .from('alas')
    .insert({ nome: nome.trim(), estaca_id: estacaId } as never)
    .select('id')
    .single()

  const novaAla = novaAlaRaw as { id: string } | null

  if (error || !novaAla) {
    redirect('/completar-cadastro?action=criar-ala&error=erro_criar')
  }

  const { error: updateError } = await supabase
    .from('users')
    .update({ ala_id: novaAla.id } as never)
    .eq('id', user.id)

  if (updateError) {
    redirect(`/completar-cadastro?ala_id=${novaAla.id}&error=salvar`)
  }

  redirect('/dashboard')
}

async function criarEstaca(formData: FormData) {
  'use server'

  const nome = formData.get('nome')

  if (typeof nome !== 'string' || !nome.trim()) {
    redirect('/completar-cadastro?action=criar-estaca&error=nome_obrigatorio')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
    .overrideTypes<{ role: UserRole }, { merge: false }>()

  if (!profile || !can.manageUnidades(profile.role)) {
    redirect('/completar-cadastro?action=criar-estaca&error=sem_permissao')
  }

  const { data: existing } = await supabase
    .from('estacas')
    .select('id')
    .eq('nome', nome.trim())
    .maybeSingle()

  if (existing) {
    redirect('/completar-cadastro?action=criar-estaca&error=estaca_existente')
  }

  const { data: novaEstacaRaw, error } = await supabase
    .from('estacas')
    .insert({ nome: nome.trim() } as never)
    .select('id')
    .single()

  const novaEstaca = novaEstacaRaw as { id: string } | null

  if (error || !novaEstaca) {
    redirect('/completar-cadastro?action=criar-estaca&error=erro_criar')
  }

  redirect(`/completar-cadastro?action=criar-ala&estaca_id=${novaEstaca.id}`)
}

export default async function CompletarCadastroPage({
  searchParams,
}: {
  searchParams?: { 
    error?: string
    action?: string
    ala_id?: string
    estaca_id?: string
  }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('ala_id, role')
    .eq('id', user.id)
    .single()
    .overrideTypes<UserProfileStatus, { merge: false }>()

  if (profile?.ala_id) redirect('/dashboard')

  const isAdm = profile && can.manageUnidades(profile.role)
  const isCreatingAla = searchParams?.action === 'criar-ala'
  const isCreatingEstaca = searchParams?.action === 'criar-estaca'
  const preselectedEstacaId = searchParams?.estaca_id ?? ''

  const { data: alasRaw } = await supabase
    .from('alas')
    .select('id, nome, estaca:estacas(nome)')
    .order('nome', { ascending: true })

  const { data: estacasRaw } = await supabase
    .from('estacas')
    .select('id, nome')
    .order('nome', { ascending: true })

  const alas = alasRaw as AlaOption[] | null
  const estacas = estacasRaw as EstacaOption[] | null

  const errorMessage =
    searchParams?.error === 'ala_obrigatoria'
      ? 'Selecione uma ala para continuar.'
      : searchParams?.error === 'salvar'
        ? 'Não foi possível salvar sua ala. Tente novamente.'
        : searchParams?.error === 'sem_permissao'
          ? 'Sem permissão para criar unidade.'
          : searchParams?.error === 'nome_obrigatorio'
            ? 'O nome é obrigatório.'
            : searchParams?.error === 'estaca_obrigatoria'
              ? 'Selecione uma estaca.'
              : searchParams?.error === 'ala_existente'
                ? 'Já existe uma ala com este nome nesta estaca.'
                : searchParams?.error === 'estaca_existente'
                  ? 'Já existe uma estaca com este nome.'
                  : searchParams?.error === 'erro_criar'
                    ? 'Erro ao criar. Tente novamente.'
                    : null

  const inputClass = 'block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <div className="mx-auto my-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600">
          <BookOpen className="h-7 w-7 text-white" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-slate-100">
          Completar cadastro
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Escolha sua unidade para acessar as atas da ala correta.
        </p>
      </div>

      {/* ─── Selecionar ala existente ─── */}
      {!isCreatingAla && !isCreatingEstaca && (
        <form action={completeCadastro} className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 dark:bg-slate-800 dark:ring-slate-700">
          {isAdm && (
            <a
              href="/completar-cadastro?action=criar-ala"
              className="mb-4 flex items-center gap-2 rounded-lg border border-dashed border-brand-300 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-100 dark:border-brand-700 dark:bg-brand-950 dark:text-brand-300 dark:hover:bg-brand-900"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Criar nova ala
            </a>
          )}

          <label htmlFor="ala_id" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
            Ala
          </label>
          <div className="relative mt-2">
            <select
              id="ala_id"
              name="ala_id"
              required
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              defaultValue=""
            >
              <option value="" disabled>
                Selecione sua ala
              </option>
              {(alas ?? []).map(ala => (
                <option key={ala.id} value={ala.id}>
                  {ala.nome}{ala.estaca ? ` - ${ala.estaca.nome}` : ''}
                </option>
              ))}
            </select>
            <MapPin
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-slate-500"
              aria-hidden="true"
            />
          </div>

          {errorMessage && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
              {errorMessage}
            </p>
          )}

          {!alas?.length && (
            <p className="mt-3 text-sm text-amber-700 dark:text-amber-400">
              Nenhuma ala cadastrada. {isAdm ? 'Crie uma nova ala acima.' : 'Peça para um administrador criar uma unidade primeiro.'}
            </p>
          )}

          <button
            type="submit"
            disabled={!alas?.length}
            className="mt-6 flex w-full items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-brand-600 dark:hover:bg-brand-700"
          >
            Continuar
          </button>
        </form>
      )}

      {/* ─── Criar ala ─── */}
      {isCreatingAla && !isCreatingEstaca && (
        <form action={criarAla} className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 dark:bg-slate-800 dark:ring-slate-700">
          <p className="mb-4 text-sm text-gray-600 dark:text-slate-400">
            Crie uma nova ala e vincule-se automaticamente a ela.
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                Nome da ala
              </label>
              <input
                id="nome"
                name="nome"
                type="text"
                required
                className={`${inputClass} mt-1`}
                placeholder="Ex: Ala Jardim Atlântico"
              />
            </div>

            <div>
              <label htmlFor="estaca_id" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                Estaca
              </label>

              {isAdm && (
                <a
                  href="/completar-cadastro?action=criar-estaca"
                  className="mb-2 flex items-center gap-2 rounded-lg border border-dashed border-brand-300 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-100 dark:border-brand-700 dark:bg-brand-950 dark:text-brand-300 dark:hover:bg-brand-900"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  Criar nova estaca
                </a>
              )}

              <select
                id="estaca_id"
                name="estaca_id"
                required
                className={`${inputClass} mt-1`}
                defaultValue={preselectedEstacaId}
              >
                <option value="" disabled>
                  Selecione uma estaca
                </option>
                {(estacas ?? []).map(estaca => (
                  <option key={estaca.id} value={estaca.id}>
                    {estaca.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {errorMessage && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
              {errorMessage}
            </p>
          )}

          <div className="mt-6 flex items-center gap-3">
            <a
              href="/completar-cadastro"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Voltar
            </a>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 dark:bg-brand-600 dark:hover:bg-brand-700"
            >
              Criar e vincular
            </button>
          </div>
        </form>
      )}

      {/* ─── Criar estaca ─── */}
      {isCreatingEstaca && (
        <form action={criarEstaca} className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 dark:bg-slate-800 dark:ring-slate-700">
          <p className="mb-4 text-sm text-gray-600 dark:text-slate-400">
            Crie uma nova estaca para poder vincular uma ala a ela.
          </p>

          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
              Nome da estaca
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              required
              className={`${inputClass} mt-1`}
              placeholder="Ex: Estaca Recife Leste"
            />
          </div>

          {errorMessage && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
              {errorMessage}
            </p>
          )}

          <div className="mt-6 flex items-center gap-3">
            <a
              href="/completar-cadastro?action=criar-ala"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Voltar
            </a>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 dark:bg-brand-600 dark:hover:bg-brand-700"
            >
              Criar estaca
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
