'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen,
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Pencil,
  Loader2,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client'
import { can } from '@/lib/permissions'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useUnidades, useAlterarMinhaAla } from '@/hooks/useAdmin'
import type { User } from '@/types/domain'

type AppShellProps = {
  user: User
  children: React.ReactNode
}

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  adminOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',    label: 'Início',    icon: LayoutDashboard },
  { href: '/atas',         label: 'Atas',      icon: FileText },
  { href: '/modelos',      label: 'Modelos',   icon: BookOpen, adminOnly: true },
  { href: '/admin/usuarios',  label: 'Usuários', icon: Users, adminOnly: true },
  { href: '/admin/unidades',  label: 'Unidades', icon: Building2, adminOnly: true },
]

export function AppShell({ user, children }: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [alterandoAla, setAlterandoAla] = useState(false)
  const isAdm = can.manageUsers(user.role)
  const { data: unidades } = useUnidades()
  const { mutate: alterarAla, isPending: alterandoAlaLoading } = useAlterarMinhaAla()

  const visibleItems = NAV_ITEMS.filter(item => !item.adminOnly || isAdm)

  function handleAlterarAla(alaId: string) {
    alterarAla(alaId === '' ? null : alaId, {
      onSuccess: () => {
        setAlterandoAla(false)
        router.refresh()
      },
    })
  }

  async function handleLogout() {
    const supabase = createBrowserSupabaseClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-200 px-6 dark:border-slate-700">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
            <BookOpen className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">Atas Sacramentais</span>
        </div>
      </div>

      {/* Ala info */}
      <div className="border-b border-gray-100 px-6 py-3 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">Unidade</p>
          <button
            onClick={() => setAlterandoAla(!alterandoAla)}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
            aria-label="Alterar unidade"
          >
            <Pencil className="h-3 w-3" />
          </button>
        </div>
        {alterandoAla ? (
          <div className="mt-1.5 flex items-center gap-2">
            <select
              value={user.ala?.id ?? ''}
              onChange={e => handleAlterarAla(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              disabled={alterandoAlaLoading}
              autoFocus
            >
              <option value="">Nenhuma</option>
              {unidades?.alas?.map(a => (
                <option key={a.id} value={a.id}>{a.nome}</option>
              ))}
            </select>
            {alterandoAlaLoading && <Loader2 className="h-4 w-4 animate-spin shrink-0 text-gray-400" />}
          </div>
        ) : (
          <p className="mt-0.5 text-sm font-medium text-gray-700 dark:text-slate-300">
            {user.ala?.nome ?? 'Nenhuma'}
          </p>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3 py-4" aria-label="Navegação principal">
        {visibleItems.map(item => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {item.label}
              {isActive && (
                <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-50" aria-hidden="true" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Theme */}
      <div className="flex justify-center border-t border-gray-200 px-3 py-2.5 dark:border-slate-700">
        <ThemeToggle />
      </div>

      {/* User */}
      <div className="border-t border-gray-200 p-3 dark:border-slate-700">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-200">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900 dark:text-slate-100">{user.name}</p>
            <p className="truncate text-xs text-gray-500 dark:text-slate-400">{user.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-md p-1 text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:text-slate-400 dark:hover:text-slate-200"
            aria-label="Sair da conta"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-900">
      {/* Sidebar — desktop */}
      <aside
        className="no-print hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-white lg:flex dark:border-slate-700 dark:bg-slate-800"
        aria-label="Menu lateral"
      >
        <SidebarContent />
      </aside>

      {/* Sidebar — mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 animate-fade-in lg:hidden"
          aria-modal="true"
          role="dialog"
          aria-label="Menu de navegação"
        >
          <div
            className="absolute inset-0 bg-black/30 animate-fade-in"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl animate-slide-up dark:bg-slate-800">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar — mobile */}
        <header className="no-print flex h-14 items-center border-b border-gray-200 bg-white px-4 lg:hidden dark:border-slate-700 dark:bg-slate-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label="Abrir menu"
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
          <span className="ml-3 text-sm font-semibold text-gray-900 dark:text-slate-100">Atas Sacramentais</span>
        </header>

        {/* Page content */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-4 lg:p-8"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
