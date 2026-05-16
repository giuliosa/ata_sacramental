import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { BookOpen, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

export const metadata: Metadata = {
  title: 'Completar cadastro',
}

type UserProfileStatus = {
  ala_id: string | null
}

type AlaOption = {
  id: string
  nome: string
  estaca: { nome: string } | null
}

type UserProfileUpdate = Database['public']['Tables']['users']['Update']

async function completeCadastro(formData: FormData) {
  'use server'

  const alaId = formData.get('ala_id')

  if (typeof alaId !== 'string' || !alaId) {
    redirect('/completar-cadastro?error=ala_obrigatoria')
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profileUpdate = { ala_id: alaId } satisfies UserProfileUpdate

  const { error } = await supabase
    .from('users')
    .update(profileUpdate as never)
    .eq('id', user.id)

  if (error) {
    redirect('/completar-cadastro?error=salvar')
  }

  redirect('/dashboard')
}

export default async function CompletarCadastroPage({
  searchParams,
}: {
  searchParams?: { error?: string }
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('ala_id')
    .eq('id', user.id)
    .single()
    .overrideTypes<UserProfileStatus, { merge: false }>()

  if (profile?.ala_id) {
    redirect('/dashboard')
  }

  const { data: alas } = await supabase
    .from('alas')
    .select('id, nome, estaca:estacas(nome)')
    .order('nome', { ascending: true })
    .overrideTypes<AlaOption[], { merge: false }>()

  const errorMessage =
    searchParams?.error === 'ala_obrigatoria'
      ? 'Selecione uma ala para continuar.'
      : searchParams?.error === 'salvar'
        ? 'Não foi possível salvar sua ala. Tente novamente.'
        : null

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600">
          <BookOpen className="h-7 w-7 text-white" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Completar cadastro
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Escolha sua unidade para acessar as atas da ala correta.
        </p>
      </div>

      <form action={completeCadastro} className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        <label htmlFor="ala_id" className="block text-sm font-medium text-gray-700">
          Ala
        </label>
        <div className="relative mt-2">
          <select
            id="ala_id"
            name="ala_id"
            required
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
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
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
        </div>

        {errorMessage && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {errorMessage}
          </p>
        )}

        {!alas?.length && (
          <p className="mt-3 text-sm text-amber-700">
            Nenhuma ala cadastrada. Peça para um administrador criar uma unidade primeiro.
          </p>
        )}

        <button
          type="submit"
          disabled={!alas?.length}
          className="mt-6 flex w-full items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Continuar
        </button>
      </form>
    </div>
  )
}
