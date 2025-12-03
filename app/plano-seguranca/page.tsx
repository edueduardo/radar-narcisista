'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Shield, 
  Phone, 
  FileText, 
  Briefcase, 
  MapPin,
  Lock,
  Plus,
  Check,
  X,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Save,
  Loader2,
  CheckCircle,
  Sparkles
} from 'lucide-react'
import { useClarityProfile } from '@/hooks/useClarityProfile'

// ============================================
// TIPOS
// ============================================

interface EmergencyContact {
  id: string
  name: string
  phone: string
  relationship: string
  isPrimary: boolean
}

interface ImportantDocument {
  id: string
  name: string
  location: string
  hasCopy: boolean
}

interface EmergencyBagItem {
  id: string
  item: string
  packed: boolean
}

interface SafePlace {
  address: string
  contactName: string
  contactPhone: string
  notes: string
}

interface DigitalSecurity {
  changedPasswords: boolean
  removedTrackingApps: boolean
  usesPrivateBrowsing: boolean
  hasSecureEmail: boolean
}

interface SafetyPlan {
  emergencyContacts: EmergencyContact[]
  importantDocuments: ImportantDocument[]
  emergencyBagItems: EmergencyBagItem[]
  safePlace: SafePlace | null
  digitalSecurity: DigitalSecurity
  overallStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'READY'
  lastReviewedAt: string | null
  notes: string
}

// ============================================
// DADOS INICIAIS
// ============================================

const DEFAULT_DOCUMENTS = [
  'RG / CPF',
  'Certidão de nascimento',
  'Certidão de casamento',
  'Carteira de trabalho',
  'Comprovante de residência',
  'Cartão do banco',
  'Receitas médicas',
  'Documentos dos filhos'
]

const DEFAULT_BAG_ITEMS = [
  'Documentos importantes',
  'Dinheiro em espécie',
  'Celular e carregador',
  'Roupas para 3 dias',
  'Medicamentos',
  'Itens de higiene',
  'Chaves reserva',
  'Lista de contatos impressa'
]

const getDefaultPlan = (): SafetyPlan => ({
  emergencyContacts: [],
  importantDocuments: DEFAULT_DOCUMENTS.map((doc, i) => ({
    id: `doc-${i}`,
    name: doc,
    location: '',
    hasCopy: false
  })),
  emergencyBagItems: DEFAULT_BAG_ITEMS.map((item, i) => ({
    id: `item-${i}`,
    item,
    packed: false
  })),
  safePlace: null,
  digitalSecurity: {
    changedPasswords: false,
    removedTrackingApps: false,
    usesPrivateBrowsing: false,
    hasSecureEmail: false
  },
  overallStatus: 'NOT_STARTED',
  lastReviewedAt: null,
  notes: ''
})

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function PlanoSegurancaPage() {
  const router = useRouter()
  
  // Hook para perfil de clareza (alerta de risco físico)
  const { profile: clarityProfile, hasProfile: hasClarityProfile } = useClarityProfile()
  
  const [plan, setPlan] = useState<SafetyPlan>(getDefaultPlan())
  const [planId, setPlanId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showPhysicalRiskAlert, setShowPhysicalRiskAlert] = useState(true)

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    contacts: true,
    documents: false,
    bag: false,
    safePlace: false,
    digital: false
  })

  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' })
  const [showAddContact, setShowAddContact] = useState(false)

  // ============================================
  // CARREGAR PLANO VIA API /api/safety-plan
  // ============================================
  
  useEffect(() => {
    loadPlan()
  }, [])

  const loadPlan = async () => {
    try {
      const response = await fetch('/api/safety-plan')
      
      if (response.status === 401) {
        router.push('/login')
        return
      }
      
      const result = await response.json()
      
      if (result.error) {
        console.error('Erro ao carregar plano:', result.error)
        return
      }

      if (result.plan) {
        setPlanId(result.plan.id)
        setPlan({
          emergencyContacts: result.plan.emergency_contacts || [],
          importantDocuments: result.plan.important_documents || getDefaultPlan().importantDocuments,
          emergencyBagItems: result.plan.emergency_bag_items || getDefaultPlan().emergencyBagItems,
          safePlace: result.plan.safe_place || null,
          digitalSecurity: result.plan.digital_security || getDefaultPlan().digitalSecurity,
          overallStatus: result.status || 'NOT_STARTED',
          lastReviewedAt: result.plan.last_reviewed_at,
          notes: result.plan.notes || ''
        })
        if (result.plan.updated_at) {
          setLastSaved(new Date(result.plan.updated_at))
        }
      }
    } catch (error) {
      console.error('Erro ao carregar plano:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // ============================================
  // SALVAR PLANO VIA API /api/safety-plan (com debounce)
  // ============================================

  const savePlan = useCallback(async (planToSave: SafetyPlan) => {
    setSaveStatus('saving')
    setIsSaving(true)

    try {
      // Preparar payload para a API
      const payload = {
        emergency_contacts: planToSave.emergencyContacts.map(c => ({
          name: c.name,
          phone: c.phone,
          relationship: c.relationship,
          is_primary: c.isPrimary
        })),
        important_documents: planToSave.importantDocuments.map(d => ({
          name: d.name,
          location: d.location,
          has_copy: d.hasCopy
        })),
        emergency_bag_items: planToSave.emergencyBagItems.map(i => ({
          item: i.item,
          packed: i.packed
        })),
        safe_place: planToSave.safePlace ? {
          address: planToSave.safePlace.address,
          contact_name: planToSave.safePlace.contactName,
          contact_phone: planToSave.safePlace.contactPhone,
          notes: planToSave.safePlace.notes
        } : null,
        digital_security: {
          changed_passwords: planToSave.digitalSecurity.changedPasswords,
          removed_tracking_apps: planToSave.digitalSecurity.removedTrackingApps,
          uses_private_browsing: planToSave.digitalSecurity.usesPrivateBrowsing,
          has_secure_email: planToSave.digitalSecurity.hasSecureEmail
        },
        notes: planToSave.notes
      }

      const method = planId ? 'PATCH' : 'POST'
      const response = await fetch('/api/safety-plan', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao salvar plano')
      }

      if (result.plan?.id && !planId) {
        setPlanId(result.plan.id)
      }

      setLastSaved(new Date())
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      console.error('Erro ao salvar plano:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }, [planId])

  // Auto-save quando o plano muda
  useEffect(() => {
    if (isLoading) return
    
    const timeoutId = setTimeout(() => {
      savePlan(plan)
    }, 1500) // Debounce de 1.5s

    return () => clearTimeout(timeoutId)
  }, [plan, isLoading])

  // Função auxiliar para calcular progresso
  const calculateProgressFromPlan = (p: SafetyPlan) => {
    let total = 0
    let completed = 0

    total += 1
    if (p.emergencyContacts.length > 0) completed += 1

    total += 1
    const docsWithLocation = p.importantDocuments.filter(d => d.location).length
    if (docsWithLocation >= p.importantDocuments.length / 2) completed += 1

    total += 1
    const packedItems = p.emergencyBagItems.filter(i => i.packed).length
    if (packedItems >= p.emergencyBagItems.length / 2) completed += 1

    total += 1
    if (p.safePlace?.address) completed += 1

    total += 1
    const digitalChecks = Object.values(p.digitalSecurity).filter(Boolean).length
    if (digitalChecks >= 2) completed += 1

    return Math.round((completed / total) * 100)
  }

  // Calcular progresso
  const calculateProgress = () => {
    let total = 0
    let completed = 0

    // Contatos (pelo menos 1)
    total += 1
    if (plan.emergencyContacts.length > 0) completed += 1

    // Documentos (pelo menos 50% com localização)
    total += 1
    const docsWithLocation = plan.importantDocuments.filter(d => d.location).length
    if (docsWithLocation >= plan.importantDocuments.length / 2) completed += 1

    // Mala (pelo menos 50% empacotado)
    total += 1
    const packedItems = plan.emergencyBagItems.filter(i => i.packed).length
    if (packedItems >= plan.emergencyBagItems.length / 2) completed += 1

    // Local seguro
    total += 1
    if (plan.safePlace?.address) completed += 1

    // Segurança digital (pelo menos 2 itens)
    total += 1
    const digitalChecks = Object.values(plan.digitalSecurity).filter(Boolean).length
    if (digitalChecks >= 2) completed += 1

    return Math.round((completed / total) * 100)
  }

  const progress = calculateProgress()

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const addContact = () => {
    if (!newContact.name || !newContact.phone) return
    
    setPlan(prev => ({
      ...prev,
      emergencyContacts: [
        ...prev.emergencyContacts,
        {
          id: `contact-${Date.now()}`,
          ...newContact,
          isPrimary: prev.emergencyContacts.length === 0
        }
      ]
    }))
    setNewContact({ name: '', phone: '', relationship: '' })
    setShowAddContact(false)
  }

  const removeContact = (id: string) => {
    setPlan(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter(c => c.id !== id)
    }))
  }

  const toggleDocumentCopy = (id: string) => {
    setPlan(prev => ({
      ...prev,
      importantDocuments: prev.importantDocuments.map(d =>
        d.id === id ? { ...d, hasCopy: !d.hasCopy } : d
      )
    }))
  }

  const updateDocumentLocation = (id: string, location: string) => {
    setPlan(prev => ({
      ...prev,
      importantDocuments: prev.importantDocuments.map(d =>
        d.id === id ? { ...d, location } : d
      )
    }))
  }

  const toggleBagItem = (id: string) => {
    setPlan(prev => ({
      ...prev,
      emergencyBagItems: prev.emergencyBagItems.map(i =>
        i.id === id ? { ...i, packed: !i.packed } : i
      )
    }))
  }

  const updateSafePlace = (field: keyof SafePlace, value: string) => {
    setPlan(prev => ({
      ...prev,
      safePlace: {
        address: '',
        contactName: '',
        contactPhone: '',
        notes: '',
        ...prev.safePlace,
        [field]: value
      }
    }))
  }

  const toggleDigitalSecurity = (field: keyof DigitalSecurity) => {
    setPlan(prev => ({
      ...prev,
      digitalSecurity: {
        ...prev.digitalSecurity,
        [field]: !prev.digitalSecurity[field]
      }
    }))
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Carregando seu plano...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </Link>
            
            {/* Indicador de salvamento */}
            <div className="flex items-center gap-2 text-sm">
              {saveStatus === 'saving' && (
                <span className="flex items-center gap-1 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  Salvo
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="flex items-center gap-1 text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  Erro ao salvar
                </span>
              )}
              {saveStatus === 'idle' && lastSaved && (
                <span className="text-gray-400 text-xs">
                  Salvo às {lastSaved.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-900 rounded-2xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Plano de Segurança
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Prepare-se para situações de emergência
              </p>
            </div>
          </div>
        </div>

        {/* Alerta de Risco Físico baseado no Teste de Clareza */}
        {hasClarityProfile && clarityProfile?.hasPhysicalRisk && showPhysicalRiskAlert && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/50 dark:to-orange-950/50 border-2 border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 dark:text-red-300 mb-1">
                  ⚠️ Atenção: Sinais de Risco Físico Detectados
                </h3>
                <p className="text-sm text-red-700 dark:text-red-400 mb-2">
                  Seu Teste de Clareza indicou sinais de possível risco físico. É muito importante que você preencha este Plano de Segurança com atenção e mantenha-o atualizado.
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded">
                    Priorize contatos de emergência
                  </span>
                  <span className="px-2 py-1 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded">
                    Tenha documentos prontos
                  </span>
                  <span className="px-2 py-1 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded">
                    Identifique um local seguro
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowPhysicalRiskAlert(false)}
                className="p-1 text-red-400 hover:text-red-600 dark:hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Progresso */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-gray-900 dark:text-white">Progresso do Plano</span>
            <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                progress < 30 ? 'bg-red-500' :
                progress < 70 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {progress < 30 && '⚠️ Seu plano está no início. Complete mais seções para estar preparada.'}
            {progress >= 30 && progress < 70 && '🔄 Bom progresso! Continue completando as seções.'}
            {progress >= 70 && '✅ Ótimo! Seu plano está quase completo.'}
          </p>
        </div>

        {/* Alerta de emergência */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-700 dark:text-red-300 mb-2">
                Em perigo imediato?
              </h3>
              <div className="flex flex-wrap gap-2">
                <a href="tel:190" className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium">
                  📞 190 - Polícia
                </a>
                <a href="tel:180" className="px-3 py-1.5 bg-pink-600 text-white rounded-lg text-sm font-medium">
                  📞 180 - Central da Mulher
                </a>
                <a href="tel:188" className="px-3 py-1.5 bg-yellow-600 text-white rounded-lg text-sm font-medium">
                  📞 188 - CVV
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Seções */}
        <div className="space-y-4">
          
          {/* Contatos de Emergência */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection('contacts')}
              className="w-full flex items-center justify-between p-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                  <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <h2 className="font-semibold text-gray-900 dark:text-white">Contatos de Emergência</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {plan.emergencyContacts.length} contato(s) cadastrado(s)
                  </p>
                </div>
              </div>
              {expandedSections.contacts ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {expandedSections.contacts && (
              <div className="px-5 pb-5 space-y-3">
                {plan.emergencyContacts.map(contact => (
                  <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{contact.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{contact.phone} • {contact.relationship}</p>
                    </div>
                    <button onClick={() => removeContact(contact.id)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {showAddContact ? (
                  <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-xl space-y-3">
                    <input
                      type="text"
                      placeholder="Nome"
                      value={newContact.name}
                      onChange={e => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                    />
                    <input
                      type="tel"
                      placeholder="Telefone"
                      value={newContact.phone}
                      onChange={e => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                    />
                    <input
                      type="text"
                      placeholder="Relação (ex: irmã, amiga)"
                      value={newContact.relationship}
                      onChange={e => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                    />
                    <div className="flex gap-2">
                      <button onClick={addContact} className="flex-1 py-2 bg-purple-600 text-white rounded-lg font-medium">
                        Adicionar
                      </button>
                      <button onClick={() => setShowAddContact(false)} className="px-4 py-2 bg-gray-200 dark:bg-slate-600 rounded-lg">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddContact(true)}
                    className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl text-gray-500 dark:text-gray-400 hover:border-purple-500 hover:text-purple-500 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar contato
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Documentos Importantes */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection('documents')}
              className="w-full flex items-center justify-between p-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="text-left">
                  <h2 className="font-semibold text-gray-900 dark:text-white">Documentos Importantes</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {plan.importantDocuments.filter(d => d.hasCopy).length}/{plan.importantDocuments.length} com cópia
                  </p>
                </div>
              </div>
              {expandedSections.documents ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {expandedSections.documents && (
              <div className="px-5 pb-5 space-y-2">
                {plan.importantDocuments.map(doc => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-xl">
                    <button
                      onClick={() => toggleDocumentCopy(doc.id)}
                      className={`w-6 h-6 rounded-md flex items-center justify-center ${
                        doc.hasCopy ? 'bg-green-500 text-white' : 'border-2 border-gray-300 dark:border-slate-500'
                      }`}
                    >
                      {doc.hasCopy && <Check className="w-4 h-4" />}
                    </button>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{doc.name}</p>
                      <input
                        type="text"
                        placeholder="Onde está guardado?"
                        value={doc.location}
                        onChange={e => updateDocumentLocation(doc.id, e.target.value)}
                        className="w-full mt-1 px-2 py-1 text-xs rounded border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mala de Emergência */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection('bag')}
              className="w-full flex items-center justify-between p-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <h2 className="font-semibold text-gray-900 dark:text-white">Mala de Emergência</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {plan.emergencyBagItems.filter(i => i.packed).length}/{plan.emergencyBagItems.length} itens prontos
                  </p>
                </div>
              </div>
              {expandedSections.bag ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {expandedSections.bag && (
              <div className="px-5 pb-5 space-y-2">
                {plan.emergencyBagItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => toggleBagItem(item.id)}
                    className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-xl text-left"
                  >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                      item.packed ? 'bg-green-500 text-white' : 'border-2 border-gray-300 dark:border-slate-500'
                    }`}>
                      {item.packed && <Check className="w-4 h-4" />}
                    </div>
                    <span className={`text-sm ${item.packed ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                      {item.item}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Local Seguro */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection('safePlace')}
              className="w-full flex items-center justify-between p-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-left">
                  <h2 className="font-semibold text-gray-900 dark:text-white">Local Seguro</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {plan.safePlace?.address ? 'Configurado' : 'Não configurado'}
                  </p>
                </div>
              </div>
              {expandedSections.safePlace ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {expandedSections.safePlace && (
              <div className="px-5 pb-5 space-y-3">
                <input
                  type="text"
                  placeholder="Endereço do local seguro"
                  value={plan.safePlace?.address || ''}
                  onChange={e => updateSafePlace('address', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                />
                <input
                  type="text"
                  placeholder="Nome do contato no local"
                  value={plan.safePlace?.contactName || ''}
                  onChange={e => updateSafePlace('contactName', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                />
                <input
                  type="tel"
                  placeholder="Telefone do contato"
                  value={plan.safePlace?.contactPhone || ''}
                  onChange={e => updateSafePlace('contactPhone', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                />
                <textarea
                  placeholder="Observações (ex: chave embaixo do tapete)"
                  value={plan.safePlace?.notes || ''}
                  onChange={e => updateSafePlace('notes', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 resize-none"
                  rows={2}
                />
              </div>
            )}
          </div>

          {/* Segurança Digital */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection('digital')}
              className="w-full flex items-center justify-between p-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900 rounded-xl flex items-center justify-center">
                  <Lock className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div className="text-left">
                  <h2 className="font-semibold text-gray-900 dark:text-white">Segurança Digital</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {Object.values(plan.digitalSecurity).filter(Boolean).length}/4 itens verificados
                  </p>
                </div>
              </div>
              {expandedSections.digital ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {expandedSections.digital && (
              <div className="px-5 pb-5 space-y-2">
                {[
                  { key: 'changedPasswords', label: 'Mudei senhas importantes (e-mail, banco, redes sociais)' },
                  { key: 'removedTrackingApps', label: 'Verifiquei e removi apps de rastreamento' },
                  { key: 'usesPrivateBrowsing', label: 'Uso navegação privada para acessar o Radar' },
                  { key: 'hasSecureEmail', label: 'Tenho um e-mail seguro que só eu acesso' }
                ].map(item => (
                  <button
                    key={item.key}
                    onClick={() => toggleDigitalSecurity(item.key as keyof DigitalSecurity)}
                    className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-xl text-left"
                  >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                      plan.digitalSecurity[item.key as keyof DigitalSecurity] 
                        ? 'bg-green-500 text-white' 
                        : 'border-2 border-gray-300 dark:border-slate-500'
                    }`}>
                      {plan.digitalSecurity[item.key as keyof DigitalSecurity] && <Check className="w-4 h-4" />}
                    </div>
                    <span className="text-sm text-gray-900 dark:text-white">{item.label}</span>
                  </button>
                ))}
                
                <Link 
                  href="/seguranca-digital"
                  className="block mt-3 text-center text-sm text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Ver mais dicas de segurança digital →
                </Link>
              </div>
            )}
          </div>

        </div>

        {/* Botão salvar */}
        <div className="mt-6">
          <button className="w-full flex items-center justify-center gap-2 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-semibold transition-colors">
            <Save className="w-5 h-5" />
            Salvar Plano de Segurança
          </button>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
            Seus dados são criptografados e só você tem acesso
          </p>
        </div>
      </div>
    </div>
  )
}
