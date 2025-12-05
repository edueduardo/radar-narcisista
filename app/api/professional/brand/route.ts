/**
 * API: /api/professional/brand
 * ETAPA 13 - Infra White-label Profissional (V1)
 * 
 * GET: Retorna configuração de marca do profissional
 * POST/PUT: Cria ou atualiza configuração de marca
 * 
 * Segurança:
 * - Requer autenticação
 * - Requer plano profissional
 * - RLS garante acesso apenas à própria marca
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'

// Tipo da marca
interface ProfessionalBrand {
  id?: string
  professional_id: string
  display_name: string | null
  brand_color: string
  logo_url: string | null
  tagline: string | null
  show_radar_branding: boolean
  created_at?: string
  updated_at?: string
}

// Valores padrão
const DEFAULT_BRAND: Omit<ProfessionalBrand, 'professional_id'> = {
  display_name: null,
  brand_color: '#7C3AED', // Roxo padrão do Radar
  logo_url: null,
  tagline: null,
  show_radar_branding: true
}

// Verificar se usuário tem plano profissional
async function checkProfessionalAccess(supabase: Awaited<ReturnType<typeof createRouteHandlerClient>>, userId: string): Promise<boolean> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan_id, subscription_status')
    .eq('id', userId)
    .single()
  
  if (!profile) return false
  
  const p = profile as { plan_id?: string; subscription_status?: string }
  return p.plan_id === 'profissional' || p.subscription_status === 'professional'
}

// Validar cor hex
function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color)
}

// =============================================================================
// GET: Buscar configuração de marca
// =============================================================================
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }
    
    // Verificar plano profissional
    if (!(await checkProfessionalAccess(supabase, user.id))) {
      return NextResponse.json({ error: 'Acesso restrito ao plano Profissional' }, { status: 403 })
    }
    
    // Buscar marca existente
    const { data: brand, error } = await supabase
      .from('professional_brand')
      .select('*')
      .eq('professional_id', user.id)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Erro ao buscar marca:', error)
      return NextResponse.json({ error: 'Erro ao buscar configuração' }, { status: 500 })
    }
    
    // Se não existe, retornar defaults
    if (!brand) {
      return NextResponse.json({
        brand: {
          ...DEFAULT_BRAND,
          professional_id: user.id
        },
        isDefault: true
      })
    }
    
    return NextResponse.json({
      brand,
      isDefault: false
    })
    
  } catch (error) {
    console.error('Erro na API de brand:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// =============================================================================
// POST: Criar ou atualizar configuração de marca
// =============================================================================
export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }
    
    // Verificar plano profissional
    if (!(await checkProfessionalAccess(supabase, user.id))) {
      return NextResponse.json({ error: 'Acesso restrito ao plano Profissional' }, { status: 403 })
    }
    
    // Parsear body
    const body = await request.json()
    const { display_name, brand_color, logo_url, tagline, show_radar_branding } = body
    
    // Validar brand_color se fornecido
    if (brand_color && !isValidHexColor(brand_color)) {
      return NextResponse.json({ 
        error: 'Cor inválida. Use formato hex (#RRGGBB)' 
      }, { status: 400 })
    }
    
    // Preparar dados para upsert
    const brandData = {
      professional_id: user.id,
      display_name: display_name?.trim() || null,
      brand_color: brand_color || DEFAULT_BRAND.brand_color,
      logo_url: logo_url?.trim() || null,
      tagline: tagline?.trim() || null,
      show_radar_branding: show_radar_branding !== false // default true
    }
    
    // Verificar se já existe
    const { data: existing } = await supabase
      .from('professional_brand')
      .select('id')
      .eq('professional_id', user.id)
      .single()
    
    let result
    
    if (existing) {
      // Atualizar existente
      const { data, error } = await supabase
        .from('professional_brand')
        .update(brandData)
        .eq('professional_id', user.id)
        .select()
        .single()
      
      if (error) {
        console.error('Erro ao atualizar marca:', error)
        return NextResponse.json({ error: 'Erro ao atualizar configuração' }, { status: 500 })
      }
      
      result = data
    } else {
      // Criar nova
      const { data, error } = await supabase
        .from('professional_brand')
        .insert(brandData)
        .select()
        .single()
      
      if (error) {
        console.error('Erro ao criar marca:', error)
        return NextResponse.json({ error: 'Erro ao criar configuração' }, { status: 500 })
      }
      
      result = data
    }
    
    return NextResponse.json({
      brand: result,
      message: existing ? 'Marca atualizada com sucesso' : 'Marca criada com sucesso'
    })
    
  } catch (error) {
    console.error('Erro na API de brand:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
