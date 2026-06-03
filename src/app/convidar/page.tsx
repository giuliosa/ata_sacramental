import { Suspense } from 'react'
import type { Metadata } from 'next'
import { AcceptInviteClient } from './AcceptInviteClient'

export const metadata: Metadata = { title: 'Aceitar Convite' }

export default function InvitePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-slate-900">
      <div className="w-full max-w-md">
        <Suspense fallback={<p className="text-center text-sm text-gray-400">Carregando...</p>}>
          <AcceptInviteClient />
        </Suspense>
      </div>
    </div>
  )
}
