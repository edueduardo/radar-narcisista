'use client'

import { useState, useEffect, createContext, useContext } from 'react'

interface Frontpage {
  id: string
  name: string
  url: string
  platform: 'local' | 'lovable' | 'vercel' | 'custom'
  version: string
  weight: number
  isActive: boolean
  isExternal: boolean
}

interface FrontpageContextType {
  frontpages: Frontpage[]
  loading: boolean
  testMode: 'single' | 'ab' | 'abc'
  setTestMode: (mode: 'single' | 'ab' | 'abc') => void
  addFrontpage: (fp: Omit<Frontpage, 'id'>) => Promise<void>
  updateFrontpage: (id: string, data: Partial<Frontpage>) => Promise<void>
  deleteFrontpage: (id: string) => Promise<void>
  toggleFrontpage: (id: string) => Promise<void>
  getSelectedFrontpage: () => Frontpage | null
}

const FrontpageContext = createContext<FrontpageContextType | null>(null)

export function FrontpageProvider({ children }: { children: React.ReactNode }) {
  const [frontpages, setFrontpages] = useState<Frontpage[]>([
    {
      id: '1',
      name: 'Frontpage Principal',
      url: '/',
      platform: 'local',
      version: 'A',
      weight: 100,
      isActive: true,
      isExternal: false
    }
  ])
  const [loading, setLoading] = useState(false)
  const [testMode, setTestMode] = useState<'single' | 'ab' | 'abc'>('single')

  const addFrontpage = async (fp: Omit<Frontpage, 'id'>) => {
    const newFp: Frontpage = {
      ...fp,
      id: Date.now().toString()
    }
    setFrontpages(prev => [...prev, newFp])
  }

  const updateFrontpage = async (id: string, data: Partial<Frontpage>) => {
    setFrontpages(prev => prev.map(fp => 
      fp.id === id ? { ...fp, ...data } : fp
    ))
  }

  const deleteFrontpage = async (id: string) => {
    setFrontpages(prev => prev.filter(fp => fp.id !== id))
  }

  const toggleFrontpage = async (id: string) => {
    setFrontpages(prev => prev.map(fp => 
      fp.id === id ? { ...fp, isActive: !fp.isActive } : fp
    ))
  }

  const getSelectedFrontpage = () => {
    const active = frontpages.filter(fp => fp.isActive)
    if (active.length === 0) return null
    if (testMode === 'single') return active[0]
    
    // Weighted random selection for A/B testing
    const totalWeight = active.reduce((sum, fp) => sum + fp.weight, 0)
    let random = Math.random() * totalWeight
    
    for (const fp of active) {
      random -= fp.weight
      if (random <= 0) return fp
    }
    
    return active[0]
  }

  return (
    <FrontpageContext.Provider value={{
      frontpages,
      loading,
      testMode,
      setTestMode,
      addFrontpage,
      updateFrontpage,
      deleteFrontpage,
      toggleFrontpage,
      getSelectedFrontpage
    }}>
      {children}
    </FrontpageContext.Provider>
  )
}

export function useFrontpage() {
  const context = useContext(FrontpageContext)
  if (!context) {
    // Return default values if not in provider
    return {
      frontpages: [],
      loading: false,
      testMode: 'single' as const,
      setTestMode: () => {},
      addFrontpage: async () => {},
      updateFrontpage: async () => {},
      deleteFrontpage: async () => {},
      toggleFrontpage: async () => {},
      getSelectedFrontpage: () => null
    }
  }
  return context
}
