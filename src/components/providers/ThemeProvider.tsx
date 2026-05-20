// 'use client'

// import { createContext, useContext, useEffect, useState, useCallback } from 'react'

// type Theme = 'light' | 'dark' | 'system'

// type ThemeContextType = {
//   theme: Theme
//   resolvedTheme: 'light' | 'dark'
//   setTheme: (theme: Theme) => void
// }

// const ThemeContext = createContext<ThemeContextType | null>(null)

// function getSystemTheme(): 'light' | 'dark' {
//   if (typeof window === 'undefined') return 'light'
//   return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
// }

// function getStoredTheme(): Theme {
//   if (typeof window === 'undefined') return 'system'
//   return (localStorage.getItem('atas-theme') as Theme) || 'system'
// }

// function applyTheme(theme: Theme) {
//   const resolved = theme === 'system' ? getSystemTheme() : theme
//   if (resolved === 'dark') {
//     document.documentElement.classList.add('dark')
//   } else {
//     document.documentElement.classList.remove('dark')
//   }
// }

// export function ThemeProvider({ children }: { children: React.ReactNode }) {
//   const [theme, setThemeState] = useState<Theme>('system')
//   const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')
//   const [mounted, setMounted] = useState(false)

//   useEffect(() => {
//     const stored = getStoredTheme()
//     const resolved = stored === 'system' ? getSystemTheme() : stored
//     setThemeState(stored)
//     setResolvedTheme(resolved)
//     applyTheme(stored)
//     setMounted(true)
//   }, [])

//   useEffect(() => {
//     if (!mounted) return
//     const mq = window.matchMedia('(prefers-color-scheme: dark)')
//     const handler = () => {
//       if (theme === 'system') {
//         const resolved = getSystemTheme()
//         setResolvedTheme(resolved)
//         applyTheme(theme)
//       }
//     }
//     mq.addEventListener('change', handler)
//     return () => mq.removeEventListener('change', handler)
//   }, [theme, mounted])

//   const setTheme = useCallback((newTheme: Theme) => {
//     setThemeState(newTheme)
//     const resolved = newTheme === 'system' ? getSystemTheme() : newTheme
//     setResolvedTheme(resolved)
//     applyTheme(newTheme)
//     try { localStorage.setItem('atas-theme', newTheme) } catch (e) {}
//   }, [])

//   return (
//     <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
//       {children}
//     </ThemeContext.Provider>
//   )
// }

// export function useTheme() {
//   const ctx = useContext(ThemeContext)
//   if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
//   return ctx
// }
