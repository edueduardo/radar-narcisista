'use client'

/**
 * Safety Provider
 * Provedor global de recursos de segurança
 * Inclui botão de pânico e atalhos de emergência
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import PanicButton from './PanicButton'

interface SafetyContextType {
  showPanicButton: boolean
  setShowPanicButton: (show: boolean) => void
  triggerQuickExit: () => void
}

const SafetyContext = createContext<SafetyContextType>({
  showPanicButton: true,
  setShowPanicButton: () => {},
  triggerQuickExit: () => {}
})

export const useSafety = () => useContext(SafetyContext)

interface Props {
  children: ReactNode
  showPanicButtonByDefault?: boolean
}

export default function SafetyProvider({ 
  children, 
  showPanicButtonByDefault = true 
}: Props) {
  const [showPanicButton, setShowPanicButton] = useState(showPanicButtonByDefault)

  const triggerQuickExit = () => {
    // Redirecionar para site seguro
    window.location.replace('https://www.google.com/search?q=receitas+de+bolo')
  }

  // Verificar preferência salva
  useEffect(() => {
    const saved = localStorage.getItem('radar_show_panic_button')
    if (saved !== null) {
      setShowPanicButton(saved === 'true')
    }
  }, [])

  // Salvar preferência
  useEffect(() => {
    localStorage.setItem('radar_show_panic_button', String(showPanicButton))
  }, [showPanicButton])

  return (
    <SafetyContext.Provider value={{ showPanicButton, setShowPanicButton, triggerQuickExit }}>
      {children}
      {showPanicButton && <PanicButton variant="floating" />}
    </SafetyContext.Provider>
  )
}
