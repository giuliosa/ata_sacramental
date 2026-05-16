'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache de 5 minutos — adequado para dados de atas que mudam raramente
            staleTime: 5 * 60 * 1000,
            // Não retry em erros 4xx (não adianta tentar de novo em "não autorizado")
            retry: (failureCount, error) => {
              if (error instanceof Error && error.message.includes('4')) return false
              return failureCount < 2
            },
          },
          mutations: {
            // Retry único em mutations para evitar duplicidade acidental
            retry: 0,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
