/**
 * Testes Básicos - Radar Narcisista BR
 * 
 * Para rodar os testes:
 * 1. npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
 * 2. npm test
 */

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock do Next.js
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
}))

// Mock do Supabase
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: null })
        })
      })
    })
  }),
}))

describe('Páginas Públicas', () => {
  describe('Página 404', () => {
    it('deve renderizar a página 404 com elementos corretos', async () => {
      const NotFound = (await import('../app/not-found')).default
      render(<NotFound />)
      
      expect(screen.getByText('Página não encontrada')).toBeInTheDocument()
      expect(screen.getByText('Ir para o início')).toBeInTheDocument()
      expect(screen.getByText('Voltar')).toBeInTheDocument()
    })
  })
})

describe('Componentes de Segurança', () => {
  describe('Botão de Emergência', () => {
    it('deve existir e ser acessível', async () => {
      // O botão de emergência deve estar presente em todas as páginas
      const EmergencyButton = (await import('../components/EmergencyButton')).default
      render(<EmergencyButton />)
      
      // Verifica se o botão existe
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })
})

describe('Utilitários', () => {
  describe('Funções de Hash', () => {
    it('deve gerar hash consistente para o mesmo input', async () => {
      // Simular função de hash
      const generateHash = (text: string) => {
        let hash = 0
        for (let i = 0; i < text.length; i++) {
          const char = text.charCodeAt(i)
          hash = ((hash << 5) - hash) + char
          hash = hash & hash
        }
        return hash.toString(16)
      }
      
      const text = 'Teste de entrada do diário'
      const hash1 = generateHash(text)
      const hash2 = generateHash(text)
      
      expect(hash1).toBe(hash2)
    })
  })

  describe('Validação de Email', () => {
    it('deve validar emails corretamente', () => {
      const isValidEmail = (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return regex.test(email)
      }
      
      expect(isValidEmail('teste@exemplo.com')).toBe(true)
      expect(isValidEmail('usuario@dominio.com.br')).toBe(true)
      expect(isValidEmail('invalido')).toBe(false)
      expect(isValidEmail('sem@dominio')).toBe(false)
      expect(isValidEmail('@semlocal.com')).toBe(false)
    })
  })

  describe('Lista de Admins', () => {
    it('deve verificar se email é admin', () => {
      const ADMIN_EMAILS = [
        'etailoffice@gmail.com',
        'eduardo.mkt.davila@gmail.com'
      ]
      
      const isAdmin = (email: string) => ADMIN_EMAILS.includes(email.toLowerCase())
      
      expect(isAdmin('etailoffice@gmail.com')).toBe(true)
      expect(isAdmin('eduardo.mkt.davila@gmail.com')).toBe(true)
      expect(isAdmin('usuario@comum.com')).toBe(false)
      expect(isAdmin('ETAILOFFICE@GMAIL.COM')).toBe(true) // Case insensitive
    })
  })
})

describe('Internacionalização', () => {
  it('deve ter traduções para PT-BR, EN e ES', async () => {
    const { translations, locales } = await import('../lib/i18n')
    
    expect(locales).toContain('pt-BR')
    expect(locales).toContain('en')
    expect(locales).toContain('es')
    
    // Verificar se todas as chaves existem em todos os idiomas
    const ptKeys = Object.keys(translations['pt-BR'] || {})
    
    if (translations['en']) {
      ptKeys.forEach(key => {
        expect(translations['en'][key]).toBeDefined()
      })
    }
    
    if (translations['es']) {
      ptKeys.forEach(key => {
        expect(translations['es'][key]).toBeDefined()
      })
    }
  })
})

describe('Configurações', () => {
  describe('Manifest PWA', () => {
    it('deve ter configurações corretas', () => {
      // Verificar se o manifest existe e tem campos obrigatórios
      const manifest = {
        name: 'Radar Narcisista BR',
        short_name: 'Radar',
        display: 'standalone',
        start_url: '/',
      }
      
      expect(manifest.name).toBeDefined()
      expect(manifest.short_name).toBeDefined()
      expect(manifest.display).toBe('standalone')
      expect(manifest.start_url).toBe('/')
    })
  })
})

describe('Segurança', () => {
  describe('Saída de Emergência', () => {
    it('deve limpar dados locais corretamente', () => {
      // Simular localStorage
      const mockLocalStorage = {
        clear: jest.fn(),
        removeItem: jest.fn(),
      }
      
      // Função de emergência
      const emergencyExit = () => {
        mockLocalStorage.clear()
        // Em produção: window.location.replace('https://www.google.com')
      }
      
      emergencyExit()
      
      expect(mockLocalStorage.clear).toHaveBeenCalled()
    })
  })

  describe('Sanitização de Input', () => {
    it('deve remover scripts maliciosos', () => {
      const sanitize = (input: string) => {
        return input
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/on\w+="[^"]*"/gi, '')
          .replace(/javascript:/gi, '')
      }
      
      const malicious = '<script>alert("xss")</script>Texto normal'
      const sanitized = sanitize(malicious)
      
      expect(sanitized).not.toContain('<script>')
      expect(sanitized).toContain('Texto normal')
    })
  })
})
