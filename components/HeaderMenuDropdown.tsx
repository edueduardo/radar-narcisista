'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { 
  ChevronDown, 
  ClipboardCheck, 
  BookOpen, 
  MessageCircle, 
  Shield, 
  BarChart3,
  Brain,
  Heart,
  Users,
  RefreshCw,
  AlertTriangle,
  Lock,
  FileText,
  Phone,
  Briefcase,
  GraduationCap
} from 'lucide-react'

interface MenuItem {
  href: string
  icon: React.ElementType
  title: string
  description: string
}

interface MenuSection {
  title: string
  items: MenuItem[]
}

const ferramentasItems: MenuItem[] = [
  {
    href: '/teste-clareza',
    icon: ClipboardCheck,
    title: 'Teste de Clareza',
    description: 'Entenda em 5 minutos se algo está errado'
  },
  {
    href: '/diario',
    icon: BookOpen,
    title: 'Diário de Episódios',
    description: 'Registre o que acontece, sem depender da memória'
  },
  {
    href: '/chat',
    icon: MessageCircle,
    title: 'Coach de Clareza',
    description: 'IA treinada para conversar sem julgamentos'
  },
  {
    href: '/estatisticas',
    icon: BarChart3,
    title: 'Suas Estatísticas',
    description: 'Visualize padrões ao longo do tempo'
  },
]

const entendaItems: MenuItem[] = [
  {
    href: '/gaslighting',
    icon: Brain,
    title: 'Gaslighting',
    description: 'Quando te fazem duvidar da própria sanidade'
  },
  {
    href: '/love-bombing',
    icon: Heart,
    title: 'Love Bombing',
    description: 'O bombardeio de amor no início da relação'
  },
  {
    href: '/triangulacao',
    icon: Users,
    title: 'Triangulação',
    description: 'Quando usam terceiros para manipular você'
  },
  {
    href: '/ciclo-abuso',
    icon: RefreshCw,
    title: 'Ciclo do Abuso',
    description: 'As 4 fases do relacionamento abusivo'
  },
]

const segurancaItems: MenuItem[] = [
  {
    href: '/seguranca',
    icon: Shield,
    title: 'Recursos de Ajuda',
    description: 'Telefones e serviços por estado'
  },
  {
    href: '/seguranca-digital',
    icon: Lock,
    title: 'Modo Discreto',
    description: 'Como usar o Radar com segurança'
  },
  {
    href: '/privacidade',
    icon: FileText,
    title: 'Privacidade',
    description: 'Como protegemos seus dados'
  },
]

const profissionaisItems: MenuItem[] = [
  {
    href: '/profissionais',
    icon: Briefcase,
    title: 'Para Psicólogos',
    description: 'Como usar o Radar em sessões'
  },
  {
    href: '/profissionais',
    icon: GraduationCap,
    title: 'Para Advogados',
    description: 'Relatórios e documentação'
  },
  {
    href: '/pesquisa/academica',
    icon: BarChart3,
    title: 'Pesquisa',
    description: 'Dados e parcerias acadêmicas'
  },
]

interface DropdownMenuProps {
  label: string
  items: MenuItem[]
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
}

function DropdownMenu({ label, items, isOpen, onToggle, onClose }: DropdownMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={onToggle}
        className={`flex items-center gap-1 text-sm font-medium transition-colors ${
          isOpen ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'
        }`}
      >
        {label}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
          {items.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              onClick={onClose}
              className="flex items-start gap-3 px-4 py-3 hover:bg-purple-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function HeaderMenuDropdown() {
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu)
  }

  const closeMenu = () => setOpenMenu(null)

  return (
    <nav className="hidden md:flex items-center gap-6">
      <DropdownMenu
        label="Ferramentas"
        items={ferramentasItems}
        isOpen={openMenu === 'ferramentas'}
        onToggle={() => toggleMenu('ferramentas')}
        onClose={closeMenu}
      />
      
      <DropdownMenu
        label="Entenda o Abuso"
        items={entendaItems}
        isOpen={openMenu === 'entenda'}
        onToggle={() => toggleMenu('entenda')}
        onClose={closeMenu}
      />
      
      <DropdownMenu
        label="Segurança"
        items={segurancaItems}
        isOpen={openMenu === 'seguranca'}
        onToggle={() => toggleMenu('seguranca')}
        onClose={closeMenu}
      />

      <DropdownMenu
        label="Profissionais"
        items={profissionaisItems}
        isOpen={openMenu === 'profissionais'}
        onToggle={() => toggleMenu('profissionais')}
        onClose={closeMenu}
      />

      <Link 
        href="/blog" 
        className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
      >
        Blog
      </Link>
    </nav>
  )
}

// Exportar também versão mobile
export function MobileMenuDropdown({ onClose }: { onClose: () => void }) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const sections: { id: string; title: string; items: MenuItem[] }[] = [
    { id: 'ferramentas', title: 'Ferramentas', items: ferramentasItems },
    { id: 'entenda', title: 'Entenda o Abuso', items: entendaItems },
    { id: 'seguranca', title: 'Segurança', items: segurancaItems },
    { id: 'profissionais', title: 'Profissionais', items: profissionaisItems },
  ]

  return (
    <div className="space-y-2">
      {sections.map((section) => (
        <div key={section.id} className="border-b border-gray-100 pb-2">
          <button
            onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
            className="flex items-center justify-between w-full py-2 text-left"
          >
            <span className="font-medium text-gray-900">{section.title}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
              expandedSection === section.id ? 'rotate-180' : ''
            }`} />
          </button>
          
          {expandedSection === section.id && (
            <div className="pl-4 space-y-1 pb-2">
              {section.items.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-3 py-2 text-sm text-gray-600 hover:text-purple-600"
                >
                  <item.icon className="w-4 h-4" />
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
      
      <Link
        href="/blog"
        onClick={onClose}
        className="block py-2 text-gray-600 hover:text-purple-600"
      >
        Blog
      </Link>
    </div>
  )
}
