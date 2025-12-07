'use client'

import AdminSidebarV2 from '@/components/AdminSidebarV2'
import AdminDemoToggle from '@/components/admin/AdminDemoToggle'
import { LanguageSelectorCompact } from '@/components/LanguageSelector'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-slate-950">
      <AdminSidebarV2 />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header com controles */}
        <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-700/50 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-indigo-600 rounded-full"></div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Painel Admin
              </h1>
              <p className="text-xs text-slate-400">Radar Narcisista</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelectorCompact />
            <AdminDemoToggle />
          </div>
        </header>
        
        {/* Conteúdo principal */}
        <main className="flex-1 overflow-auto bg-slate-950/50">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
