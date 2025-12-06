'use client'

import AdminSidebarV2 from '@/components/AdminSidebarV2'
import AdminDemoToggle from '@/components/admin/AdminDemoToggle'

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
        <header className="h-14 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-white">Painel Admin - Radar Narcisista</h1>
          </div>
          <AdminDemoToggle />
        </header>
        
        {/* Conteúdo principal */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
