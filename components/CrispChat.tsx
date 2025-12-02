'use client'

/**
 * Crisp Chat Integration
 * ETAPA 45 - Chatbot para frontpage
 * 
 * Para configurar:
 * 1. Crie conta em https://crisp.chat
 * 2. Copie o Website ID do painel
 * 3. Adicione NEXT_PUBLIC_CRISP_WEBSITE_ID no .env.local
 */

import { useEffect } from 'react'

declare global {
  interface Window {
    $crisp: unknown[]
    CRISP_WEBSITE_ID: string
  }
}

interface CrispChatProps {
  /**
   * Se true, só carrega o Crisp em páginas públicas (não logadas)
   */
  publicOnly?: boolean
}

export default function CrispChat({ publicOnly = false }: CrispChatProps) {
  useEffect(() => {
    const websiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID

    // Se não tem ID configurado, não carrega
    if (!websiteId) {
      console.log('[Crisp] NEXT_PUBLIC_CRISP_WEBSITE_ID não configurado')
      return
    }

    // Se publicOnly e está em área logada, não carrega
    if (publicOnly) {
      const isLoggedArea = window.location.pathname.startsWith('/admin') ||
                          window.location.pathname.startsWith('/dashboard') ||
                          window.location.pathname.startsWith('/chat') ||
                          window.location.pathname.startsWith('/diario')
      if (isLoggedArea) {
        return
      }
    }

    // Evita carregar duas vezes
    if (window.$crisp) {
      return
    }

    // Inicializa o Crisp
    window.$crisp = []
    window.CRISP_WEBSITE_ID = websiteId

    const script = document.createElement('script')
    script.src = 'https://client.crisp.chat/l.js'
    script.async = true
    document.head.appendChild(script)

    // Cleanup
    return () => {
      // Crisp não tem método de cleanup oficial
      // O script permanece carregado na sessão
    }
  }, [publicOnly])

  return null
}

/**
 * Hook para controlar o Crisp programaticamente
 */
export function useCrisp() {
  const open = () => {
    if (window.$crisp) {
      (window.$crisp as unknown[]).push(['do', 'chat:open'])
    }
  }

  const close = () => {
    if (window.$crisp) {
      (window.$crisp as unknown[]).push(['do', 'chat:close'])
    }
  }

  const hide = () => {
    if (window.$crisp) {
      (window.$crisp as unknown[]).push(['do', 'chat:hide'])
    }
  }

  const show = () => {
    if (window.$crisp) {
      (window.$crisp as unknown[]).push(['do', 'chat:show'])
    }
  }

  const setUser = (email: string, name?: string) => {
    if (window.$crisp) {
      (window.$crisp as unknown[]).push(['set', 'user:email', email])
      if (name) {
        (window.$crisp as unknown[]).push(['set', 'user:nickname', name])
      }
    }
  }

  const sendMessage = (message: string) => {
    if (window.$crisp) {
      (window.$crisp as unknown[]).push(['do', 'message:send', ['text', message]])
    }
  }

  return { open, close, hide, show, setUser, sendMessage }
}
