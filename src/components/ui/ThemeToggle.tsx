'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun, Monitor } from 'lucide-react'

const THEMES = [
  { value: 'light', icon: Sun, label: 'Claro' },
  { value: 'dark', icon: Moon, label: 'Escuro' },
  { value: 'system', icon: Monitor, label: 'Sistema' },
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const currentTheme = theme ?? 'system'

  return (
    <fieldset className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-100 p-0.5 dark:border-slate-600 dark:bg-slate-800">
      <legend className="sr-only">Tema</legend>
      {THEMES.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
            currentTheme === value
              ? 'bg-white text-gray-900 shadow-sm dark:bg-slate-700 dark:text-slate-100'
              : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          aria-pressed={currentTheme === value}
          aria-label={label}
        >
          <Icon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </fieldset>
  )
}
