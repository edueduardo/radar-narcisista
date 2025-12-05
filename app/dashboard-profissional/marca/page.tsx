'use client'

/**
 * ETAPA 13: Configuração de Marca (White-label V1)
 * 
 * Página onde o profissional configura sua marca:
 * - Nome público (display_name)
 * - Cor principal (brand_color)
 * - Tagline/especialidade
 * - Logo (URL por enquanto, upload será V2)
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft,
  Palette,
  Building2,
  Save,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Eye,
  Image,
  Type,
  Sparkles
} from 'lucide-react'

// =============================================================================
// TIPOS
// =============================================================================

interface ProfessionalBrand {
  id?: string
  professional_id: string
  display_name: string | null
  brand_color: string
  logo_url: string | null
  tagline: string | null
  show_radar_branding: boolean
}

// Cores predefinidas para facilitar
const PRESET_COLORS = [
  { name: 'Roxo Radar', value: '#7C3AED' },
  { name: 'Azul Profissional', value: '#2563EB' },
  { name: 'Verde Esperança', value: '#059669' },
  { name: 'Rosa Acolhedor', value: '#DB2777' },
  { name: 'Laranja Energia', value: '#EA580C' },
  { name: 'Cinza Neutro', value: '#4B5563' },
]

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export default function ConfigurarMarcaPage() {
  const router = useRouter()
  const supabase = createClient()
  
  // Estados
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Dados da marca
  const [displayName, setDisplayName] = useState('')
  const [brandColor, setBrandColor] = useState('#7C3AED')
  const [logoUrl, setLogoUrl] = useState('')
  const [tagline, setTagline] = useState('')
  const [showRadarBranding, setShowRadarBranding] = useState(true)
  
  // ==========================================================================
  // CARREGAR DADOS
  // ==========================================================================
  
  useEffect(() => {
    loadBrand()
  }, [])
  
  const loadBrand = async () => {
    try {
      // Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?redirect=/dashboard-profissional/marca')
        return
      }
      
      // Buscar marca existente
      const response = await fetch('/api/professional/brand')
      
      if (!response.ok) {
        const data = await response.json()
        if (response.status === 403) {
          router.push('/dashboard-profissional')
          return
        }
        throw new Error(data.error || 'Erro ao carregar configuração')
      }
      
      const data = await response.json()
      const brand = data.brand as ProfessionalBrand
      
      setDisplayName(brand.display_name || '')
      setBrandColor(brand.brand_color || '#7C3AED')
      setLogoUrl(brand.logo_url || '')
      setTagline(brand.tagline || '')
      setShowRadarBranding(brand.show_radar_branding !== false)
      
    } catch (err) {
      console.error('Erro ao carregar marca:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }
  
  // ==========================================================================
  // SALVAR
  // ==========================================================================
  
  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)
    
    try {
      const response = await fetch('/api/professional/brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName.trim() || null,
          brand_color: brandColor,
          logo_url: logoUrl.trim() || null,
          tagline: tagline.trim() || null,
          show_radar_branding: showRadarBranding
        })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao salvar')
      }
      
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      
    } catch (err) {
      console.error('Erro ao salvar marca:', err)
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }
  
  // ==========================================================================
  // LOADING
  // ==========================================================================
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Carregando configuração...</p>
        </div>
      </div>
    )
  }
  
  // ==========================================================================
  // RENDER
  // ==========================================================================
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard-profissional" 
            className="inline-flex items-center gap-2 text-gray-500 hover:text-purple-600 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar ao Dashboard</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: brandColor + '20' }}>
              <Palette className="w-6 h-6" style={{ color: brandColor }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Configurar Marca
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Personalize como sua prática aparece para os clientes
              </p>
            </div>
          </div>
        </div>
        
        {/* Formulário */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6">
          {/* Erro */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
          
          {/* Sucesso */}
          {success && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700 dark:text-green-300">Configuração salva com sucesso!</p>
            </div>
          )}
          
          {/* Nome público */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Building2 className="w-4 h-4" />
              Nome Público
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Ex: Clínica Esperança, Dra. Maria Silva"
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Este nome aparecerá para seus clientes no convite e no relatório.
            </p>
          </div>
          
          {/* Tagline */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Type className="w-4 h-4" />
              Especialidade / Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Ex: Psicóloga Clínica, Advogada Familiarista"
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          {/* Cor principal */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Palette className="w-4 h-4" />
              Cor Principal
            </label>
            
            {/* Cores predefinidas */}
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setBrandColor(color.value)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    brandColor === color.value 
                      ? 'border-gray-900 dark:border-white scale-110' 
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
            
            {/* Input de cor personalizada */}
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer border-0"
              />
              <input
                type="text"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                placeholder="#7C3AED"
                className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Logo URL */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Image className="w-4 h-4" />
              URL do Logo
            </label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://exemplo.com/logo.png"
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Cole a URL de uma imagem. Upload direto será disponibilizado em breve.
            </p>
            
            {/* Preview do logo */}
            {logoUrl && (
              <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview:</p>
                <img 
                  src={logoUrl} 
                  alt="Logo preview" 
                  className="max-h-16 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>
          
          {/* Mostrar branding do Radar */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Mostrar "Powered by Radar Narcisista"
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Exibe uma pequena marca do Radar nos relatórios
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowRadarBranding(!showRadarBranding)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                showRadarBranding ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span 
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  showRadarBranding ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
          
          {/* Preview */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </p>
            
            <div 
              className="p-6 rounded-xl border-2"
              style={{ borderColor: brandColor + '40', backgroundColor: brandColor + '08' }}
            >
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain" />
                ) : (
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: brandColor }}
                  >
                    {displayName ? displayName[0].toUpperCase() : 'P'}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {displayName || 'Seu Nome Aqui'}
                  </h3>
                  {tagline && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{tagline}</p>
                  )}
                </div>
              </div>
              
              {showRadarBranding && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-right">
                  Powered by Radar Narcisista
                </p>
              )}
            </div>
          </div>
          
          {/* Botão salvar */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium rounded-xl transition-colors"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Configuração
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Nota sobre V2 */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Em breve:</strong> Upload de logo, domínio personalizado e mais opções de customização.
          </p>
        </div>
      </div>
    </div>
  )
}
