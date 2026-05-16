import type { Metadata } from 'next'
import { LoginForm } from '@/features/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Entrar',
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm space-y-8">
      {/* Logo / Cabeçalho */}
      <div className="text-center">
        <div className="mx-auto my-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600">
          <svg
            className="h-7 w-7 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Atas Sacramentais
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestão de reuniões da Igreja SUD
        </p>
      </div>

      <LoginForm />
    </div>
  )
}
