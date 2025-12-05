'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { 
  Shield, 
  ArrowLeft,
  Phone,
  MapPin,
  Users,
  AlertTriangle,
  Heart,
  Home,
  Car,
  Briefcase,
  Plus,
  Edit,
  Trash2,
  Save,
  ExternalLink,
  CheckCircle
} from 'lucide-react'
import {
  RadarButton,
  RadarCard,
  RadarAlertBanner,
  RadarInput,
  RadarTextarea,
  RadarModal,
} from '@/components/ui/design-system'

// ============================================================================
// PLANO DE SEGURANÇA PREMIUM - RADAR NARCISISTA BR
// Página crítica para situações de emergência
// ============================================================================

interface SafeContact {
  id: string
  name: string
  phone: string
  relationship: string
}

interface SafePlace {
  id: string
  name: string
  address: string
  notes: string
}

export default function SegurancaPremiumPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // State
  const [contacts, setContacts] = useState<SafeContact[]>([])
  const [places, setPlaces] = useState<SafePlace[]>([])
  const [emergencyBag, setEmergencyBag] = useState<string[]>([])
  const [exitPlan, setExitPlan] = useState('')
  const [codeWord, setCodeWord] = useState('')
  
  // Modals
  const [showContactModal, setShowContactModal] = useState(false)
  const [showPlaceModal, setShowPlaceModal] = useState(false)
  const [editingContact, setEditingContact] = useState<SafeContact | null>(null)
  const [editingPlace, setEditingPlace] = useState<SafePlace | null>(null)
  
  // Form state
  const [contactForm, setContactForm] = useState({ name: '', phone: '', relationship: '' })
  const [placeForm, setPlaceForm] = useState({ name: '', address: '', notes: '' })
  const [newBagItem, setNewBagItem] = useState('')

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      
      // Carregar plano de segurança
      const { data } = await supabase
        .from('safety_plans')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (data) {
        setContacts(data.contacts || [])
        setPlaces(data.places || [])
        setEmergencyBag(data.emergency_bag || [])
        setExitPlan(data.exit_plan || '')
        setCodeWord(data.code_word || '')
      }
      
      setLoading(false)
    }
    init()
  }, [router, supabase])

  const handleSave = async () => {
    if (!user) return
    
    setSaving(true)
    try {
      await supabase
        .from('safety_plans')
        .upsert({
          user_id: user.id,
          contacts,
          places,
          emergency_bag: emergencyBag,
          exit_plan: exitPlan,
          code_word: codeWord,
          updated_at: new Date().toISOString(),
        })
    } catch (error) {
      console.error('Erro ao salvar:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAddContact = () => {
    if (!contactForm.name || !contactForm.phone) return
    
    const newContact: SafeContact = {
      id: editingContact?.id || crypto.randomUUID(),
      ...contactForm
    }
    
    if (editingContact) {
      setContacts(prev => prev.map(c => c.id === editingContact.id ? newContact : c))
    } else {
      setContacts(prev => [...prev, newContact])
    }
    
    setContactForm({ name: '', phone: '', relationship: '' })
    setEditingContact(null)
    setShowContactModal(false)
  }

  const handleAddPlace = () => {
    if (!placeForm.name) return
    
    const newPlace: SafePlace = {
      id: editingPlace?.id || crypto.randomUUID(),
      ...placeForm
    }
    
    if (editingPlace) {
      setPlaces(prev => prev.map(p => p.id === editingPlace.id ? newPlace : p))
    } else {
      setPlaces(prev => [...prev, newPlace])
    }
    
    setPlaceForm({ name: '', address: '', notes: '' })
    setEditingPlace(null)
    setShowPlaceModal(false)
  }

  const handleAddBagItem = () => {
    if (!newBagItem.trim()) return
    setEmergencyBag(prev => [...prev, newBagItem.trim()])
    setNewBagItem('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Carregando plano de segurança...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-red-950/95 backdrop-blur-sm border-b border-red-900/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <button className="p-2 text-red-300 hover:text-white hover:bg-red-900/50 rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h1 className="font-bold text-white">Plano de Segurança</h1>
                  <p className="text-xs text-red-300">Para situações de emergência</p>
                </div>
              </div>
            </div>
            
            <RadarButton onClick={handleSave} isLoading={saving} variant="danger" size="sm">
              <Save className="w-4 h-4" />
              Salvar
            </RadarButton>
          </div>
        </div>
      </header>

      {/* Emergency Banner */}
      <div className="bg-red-600 text-white py-3 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-4 text-sm">
          <span className="font-medium">Em perigo agora?</span>
          <a href="tel:190" className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full hover:bg-white/30">
            <Phone className="w-4 h-4" /> 190 - Polícia
          </a>
          <a href="tel:180" className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full hover:bg-white/30">
            <Phone className="w-4 h-4" /> 180 - Mulher
          </a>
          <a href="tel:188" className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full hover:bg-white/30">
            <Phone className="w-4 h-4" /> 188 - CVV
          </a>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* Alerta */}
        <RadarAlertBanner type="warning" title="Este plano é só seu">
          Guarde essas informações em lugar seguro. Se possível, memorize os números mais importantes.
          Não compartilhe com pessoas que possam representar risco.
        </RadarAlertBanner>

        {/* Contatos de Confiança */}
        <RadarCard variant="default" padding="md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-green-400" />
              <h2 className="font-semibold text-white">Pessoas de Confiança</h2>
            </div>
            <RadarButton 
              variant="ghost" 
              size="sm" 
              onClick={() => { setEditingContact(null); setContactForm({ name: '', phone: '', relationship: '' }); setShowContactModal(true); }}
            >
              <Plus className="w-4 h-4" /> Adicionar
            </RadarButton>
          </div>
          
          {contacts.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              Adicione pessoas que podem te ajudar em uma emergência.
            </p>
          ) : (
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                  <div>
                    <p className="font-medium text-white">{contact.name}</p>
                    <p className="text-sm text-gray-400">{contact.relationship}</p>
                    <a href={`tel:${contact.phone}`} className="text-sm text-green-400 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {contact.phone}
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setEditingContact(contact); setContactForm(contact); setShowContactModal(true); }}
                      className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setContacts(prev => prev.filter(c => c.id !== contact.id))}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </RadarCard>

        {/* Lugares Seguros */}
        <RadarCard variant="default" padding="md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-blue-400" />
              <h2 className="font-semibold text-white">Lugares Seguros</h2>
            </div>
            <RadarButton 
              variant="ghost" 
              size="sm" 
              onClick={() => { setEditingPlace(null); setPlaceForm({ name: '', address: '', notes: '' }); setShowPlaceModal(true); }}
            >
              <Plus className="w-4 h-4" /> Adicionar
            </RadarButton>
          </div>
          
          {places.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              Adicione lugares onde você pode ir em caso de emergência.
            </p>
          ) : (
            <div className="space-y-3">
              {places.map((place) => (
                <div key={place.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                  <div>
                    <p className="font-medium text-white">{place.name}</p>
                    {place.address && <p className="text-sm text-gray-400">{place.address}</p>}
                    {place.notes && <p className="text-xs text-gray-500 mt-1">{place.notes}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setEditingPlace(place); setPlaceForm(place); setShowPlaceModal(true); }}
                      className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setPlaces(prev => prev.filter(p => p.id !== place.id))}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </RadarCard>

        {/* Mochila de Emergência */}
        <RadarCard variant="default" padding="md">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="w-5 h-5 text-yellow-400" />
            <h2 className="font-semibold text-white">Mochila de Emergência</h2>
          </div>
          
          <p className="text-sm text-gray-400 mb-4">
            Itens que você deve ter prontos para sair rapidamente:
          </p>
          
          <div className="flex gap-2 mb-4">
            <RadarInput
              value={newBagItem}
              onChange={(e) => setNewBagItem(e.target.value)}
              placeholder="Ex: Documentos, dinheiro, remédios..."
              onKeyDown={(e) => e.key === 'Enter' && handleAddBagItem()}
            />
            <RadarButton onClick={handleAddBagItem} size="sm">
              <Plus className="w-4 h-4" />
            </RadarButton>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {emergencyBag.map((item, index) => (
              <span 
                key={index}
                className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 text-yellow-300 rounded-full text-sm"
              >
                <CheckCircle className="w-3 h-3" />
                {item}
                <button 
                  onClick={() => setEmergencyBag(prev => prev.filter((_, i) => i !== index))}
                  className="hover:text-red-400"
                >
                  ×
                </button>
              </span>
            ))}
            {emergencyBag.length === 0 && (
              <p className="text-gray-500 text-sm">Nenhum item adicionado ainda.</p>
            )}
          </div>
        </RadarCard>

        {/* Plano de Saída */}
        <RadarCard variant="default" padding="md">
          <div className="flex items-center gap-3 mb-4">
            <Car className="w-5 h-5 text-purple-400" />
            <h2 className="font-semibold text-white">Plano de Saída</h2>
          </div>
          
          <RadarTextarea
            value={exitPlan}
            onChange={(e) => setExitPlan(e.target.value)}
            placeholder="Descreva seu plano de saída: como você vai sair, para onde vai, quem vai te ajudar..."
            rows={4}
          />
        </RadarCard>

        {/* Palavra-Código */}
        <RadarCard variant="accent" padding="md">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-5 h-5 text-violet-400" />
            <h2 className="font-semibold text-white">Palavra-Código</h2>
          </div>
          
          <p className="text-sm text-gray-400 mb-4">
            Uma palavra ou frase que você pode usar com pessoas de confiança para sinalizar que precisa de ajuda sem alertar quem está por perto.
          </p>
          
          <RadarInput
            value={codeWord}
            onChange={(e) => setCodeWord(e.target.value)}
            placeholder="Ex: 'Preciso comprar leite' = 'Preciso de ajuda'"
          />
        </RadarCard>

        {/* Recursos Externos */}
        <RadarCard variant="soft" padding="md">
          <h2 className="font-semibold text-white mb-4">Recursos Úteis</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ExternalResource
              title="Casa da Mulher Brasileira"
              description="Atendimento integrado"
              url="https://www.gov.br/mdh/pt-br/navegue-por-temas/politicas-para-mulheres/casa-da-mulher-brasileira"
            />
            <ExternalResource
              title="Mapa de Delegacias"
              description="Encontre a mais próxima"
              url="https://www.google.com/maps/search/delegacia"
            />
            <ExternalResource
              title="CRAS - Assistência Social"
              description="Apoio social"
              url="https://www.gov.br/cidadania/pt-br/acoes-e-programas/assistencia-social/unidades-de-atendimento/cras"
            />
            <ExternalResource
              title="Defensoria Pública"
              description="Assistência jurídica gratuita"
              url="https://www.anadep.org.br/wtksite/mapa_defensorias.html"
            />
          </div>
        </RadarCard>
      </main>

      {/* Modal Contato */}
      <RadarModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title={editingContact ? 'Editar Contato' : 'Adicionar Contato'}
        size="md"
      >
        <div className="space-y-4">
          <RadarInput
            label="Nome"
            value={contactForm.name}
            onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ex: Maria (irmã)"
          />
          <RadarInput
            label="Telefone"
            value={contactForm.phone}
            onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="Ex: (11) 99999-9999"
          />
          <RadarInput
            label="Relação"
            value={contactForm.relationship}
            onChange={(e) => setContactForm(prev => ({ ...prev, relationship: e.target.value }))}
            placeholder="Ex: Irmã, amiga, vizinha..."
          />
          <div className="flex gap-3 pt-4">
            <RadarButton variant="ghost" onClick={() => setShowContactModal(false)} className="flex-1">
              Cancelar
            </RadarButton>
            <RadarButton onClick={handleAddContact} className="flex-1">
              {editingContact ? 'Salvar' : 'Adicionar'}
            </RadarButton>
          </div>
        </div>
      </RadarModal>

      {/* Modal Lugar */}
      <RadarModal
        isOpen={showPlaceModal}
        onClose={() => setShowPlaceModal(false)}
        title={editingPlace ? 'Editar Lugar' : 'Adicionar Lugar'}
        size="md"
      >
        <div className="space-y-4">
          <RadarInput
            label="Nome do lugar"
            value={placeForm.name}
            onChange={(e) => setPlaceForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ex: Casa da minha mãe"
          />
          <RadarInput
            label="Endereço (opcional)"
            value={placeForm.address}
            onChange={(e) => setPlaceForm(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Ex: Rua das Flores, 123"
          />
          <RadarTextarea
            label="Observações (opcional)"
            value={placeForm.notes}
            onChange={(e) => setPlaceForm(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Ex: Chave embaixo do vaso, porteiro 24h..."
            rows={2}
          />
          <div className="flex gap-3 pt-4">
            <RadarButton variant="ghost" onClick={() => setShowPlaceModal(false)} className="flex-1">
              Cancelar
            </RadarButton>
            <RadarButton onClick={handleAddPlace} className="flex-1">
              {editingPlace ? 'Salvar' : 'Adicionar'}
            </RadarButton>
          </div>
        </div>
      </RadarModal>
    </div>
  )
}

// Componente auxiliar
function ExternalResource({ title, description, url }: { title: string; description: string; url: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-800 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-white text-sm">{title}</p>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-500" />
        </div>
      </div>
    </a>
  )
}
