'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Menu, 
  X, 
  Settings, 
  LogOut, 
  User, 
  LayoutDashboard,
  Shield,
  ChevronDown
} from 'lucide-react'
import { useUserRole } from '@/hooks/useUserRole'
import { supabase } from '@/lib/supabaseClient'

const userNav = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Diário', href: '/diario', icon: null },
  { label: 'Chat', href: '/chat', icon: null },
]

export default function HeaderLogado() {
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { isAdmin, userEmail, isLoading } = useUserRole()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 text-xs font-black text-slate-50 shadow-lg shadow-purple-500/40">
            RN
          </span>
          <span className="hidden sm:flex flex-col text-xs font-medium text-slate-700 dark:text-slate-200">
            <span className="font-semibold tracking-tight">
              Radar Narcisista
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-4 md:flex">
          {userNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              {item.label}
            </Link>
          ))}

          {/* Botão Admin - Só aparece para admins */}
          {!isLoading && isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:from-purple-700 hover:to-blue-700 transition-all shadow-md"
            >
              <Settings className="h-3.5 w-3.5" />
              Admin
            </Link>
          )}

          {/* Menu do Perfil */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              </div>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {profileOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setProfileOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2 shadow-lg z-50">
                  {/* Email do usuário */}
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Logado como</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                      {userEmail || 'Usuário'}
                    </p>
                    {isAdmin && (
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-[0.65rem] font-semibold rounded-full">
                        <Shield className="w-3 h-3" />
                        ADMIN
                      </span>
                    )}
                  </div>

                  <Link
                    href="/perfil"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => setProfileOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Meu Perfil
                  </Link>

                  <Link
                    href="/configuracoes"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Configurações
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Painel Admin
                    </Link>
                  )}

                  <hr className="my-2 border-slate-100 dark:border-slate-800" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </div>
              </>
            )}
          </div>
        </nav>

        {/* Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Botão Admin Mobile */}
          {!isLoading && isAdmin && (
            <Link
              href="/admin"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-purple-600 text-white"
            >
              <Settings className="h-4 w-4" />
            </Link>
          )}
          
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 p-2 text-slate-700 dark:text-slate-100"
            onClick={() => setOpen((value) => !value)}
            aria-label="Abrir menu de navegação"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">
            {/* Info do usuário */}
            <div className="p-3 mb-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <p className="text-xs text-slate-500 dark:text-slate-400">Logado como</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                {userEmail || 'Usuário'}
              </p>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-[0.65rem] font-semibold rounded-full">
                  <Shield className="w-3 h-3" />
                  ADMIN
                </span>
              )}
            </div>

            {userNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {isAdmin && (
              <Link
                href="/admin"
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50"
                onClick={() => setOpen(false)}
              >
                ⚙️ Painel Admin
              </Link>
            )}

            <hr className="my-2 border-slate-200 dark:border-slate-800" />

            <Link
              href="/perfil"
              className="rounded-xl px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
              onClick={() => setOpen(false)}
            >
              Meu Perfil
            </Link>

            <Link
              href="/configuracoes"
              className="rounded-xl px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
              onClick={() => setOpen(false)}
            >
              Configurações
            </Link>

            <button
              onClick={() => {
                setOpen(false)
                handleLogout()
              }}
              className="rounded-xl px-3 py-2.5 text-sm text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
            >
              Sair
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
