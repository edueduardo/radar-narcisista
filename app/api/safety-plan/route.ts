import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * API REST para Plano de Segurança
 * ETAPA 7.3 - Integração com o Triângulo
 * 
 * GET: Retorna o plano de segurança do usuário autenticado
 * POST: Cria novo plano de segurança
 * PATCH: Atualiza plano existente
 * 
 * Após POST/PATCH bem-sucedido, cria entrada no diário (entry_type = 'safety_plan')
 */

// Tipos do payload
interface EmergencyContact {
  name: string
  phone: string
  relationship: string
  is_primary?: boolean
}

interface ImportantDocument {
  name: string
  location: string
  has_copy: boolean
}

interface EmergencyBagItem {
  item: string
  packed: boolean
}

interface SafePlace {
  address: string
  contact_name: string
  contact_phone: string
  notes: string
}

interface DigitalSecurity {
  changed_passwords: boolean
  removed_tracking_apps: boolean
  uses_private_browsing: boolean
  has_secure_email: boolean
}

interface SafetyPlanPayload {
  emergency_contacts?: EmergencyContact[]
  important_documents?: ImportantDocument[]
  emergency_bag_items?: EmergencyBagItem[]
  safe_place?: SafePlace
  digital_security?: DigitalSecurity
  notes?: string
}

// Função para calcular o status do plano
function calculatePlanStatus(plan: any): 'NOT_STARTED' | 'IN_PROGRESS' | 'READY' {
  if (!plan) return 'NOT_STARTED'
  
  const hasContacts = plan.emergency_contacts && plan.emergency_contacts.length > 0
  const hasSafePlace = plan.safe_place && plan.safe_place.address
  const hasBagItems = plan.emergency_bag_items && plan.emergency_bag_items.some((item: any) => item.packed)
  
  if (!hasContacts && !hasSafePlace && !hasBagItems) {
    return 'NOT_STARTED'
  }
  
  if (hasContacts && hasSafePlace && hasBagItems) {
    return 'READY'
  }
  
  return 'IN_PROGRESS'
}

// Função para criar entrada no diário
async function createDiaryEntry(
  supabase: any, 
  userId: string, 
  isNew: boolean
) {
  const now = new Date()
  const dateStr = now.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  
  const title = isNew ? 'Plano de Segurança criado' : 'Plano de Segurança atualizado'
  const description = isNew 
    ? `Você criou seu Plano de Segurança em ${dateStr}. Este é um passo importante para sua proteção.`
    : `Você atualizou seu Plano de Segurança em ${dateStr}. Manter o plano atualizado é essencial.`
  
  try {
    await supabase
      .from('journal_entries')
      .insert({
        user_id: userId,
        title,
        description,
        entry_type: 'safety_plan',
        tags: ['seguranca', 'plano'],
        context: 'OUTRO',
        mood_intensity: 5,
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      })
  } catch (error) {
    console.error('Erro ao criar entrada no diário:', error)
    // Não bloqueia o fluxo principal se falhar
  }
}

// GET - Retorna o plano do usuário
export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = await createRouteHandlerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }
    
    const { data: plan, error } = await supabase
      .from('safety_plans')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar plano:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar plano de segurança' },
        { status: 500 }
      )
    }
    
    if (!plan) {
      return NextResponse.json({
        plan: null,
        status: 'NOT_STARTED',
        message: 'Nenhum plano de segurança encontrado'
      })
    }
    
    return NextResponse.json({
      plan,
      status: calculatePlanStatus(plan)
    })
    
  } catch (error) {
    console.error('Erro no GET /api/safety-plan:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Cria novo plano
export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = await createRouteHandlerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }
    
    // Verificar se já existe um plano
    const { data: existingPlan } = await supabase
      .from('safety_plans')
      .select('id')
      .eq('user_id', user.id)
      .single()
    
    if (existingPlan) {
      return NextResponse.json(
        { error: 'Plano já existe. Use PATCH para atualizar.' },
        { status: 409 }
      )
    }
    
    const body: SafetyPlanPayload = await request.json()
    
    // Validação básica
    if (body.emergency_contacts && !Array.isArray(body.emergency_contacts)) {
      return NextResponse.json(
        { error: 'emergency_contacts deve ser um array' },
        { status: 400 }
      )
    }
    
    const now = new Date().toISOString()
    
    const { data: newPlan, error } = await supabase
      .from('safety_plans')
      .insert({
        user_id: user.id,
        emergency_contacts: body.emergency_contacts || [],
        important_documents: body.important_documents || [],
        emergency_bag_items: body.emergency_bag_items || [],
        safe_place: body.safe_place || null,
        digital_security: body.digital_security || {},
        notes: body.notes || '',
        overall_status: calculatePlanStatus(body),
        created_at: now,
        updated_at: now
      })
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao criar plano:', error)
      return NextResponse.json(
        { error: 'Erro ao criar plano de segurança' },
        { status: 500 }
      )
    }
    
    // Criar entrada no diário
    await createDiaryEntry(supabase, user.id, true)
    
    return NextResponse.json({
      plan: newPlan,
      status: calculatePlanStatus(newPlan),
      message: 'Plano de segurança criado com sucesso'
    }, { status: 201 })
    
  } catch (error) {
    console.error('Erro no POST /api/safety-plan:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PATCH - Atualiza plano existente
export async function PATCH(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = await createRouteHandlerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }
    
    // Buscar plano existente
    const { data: existingPlan, error: fetchError } = await supabase
      .from('safety_plans')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (fetchError || !existingPlan) {
      return NextResponse.json(
        { error: 'Plano não encontrado. Use POST para criar.' },
        { status: 404 }
      )
    }
    
    const body: SafetyPlanPayload = await request.json()
    
    // Merge dos dados
    const updatedData = {
      emergency_contacts: body.emergency_contacts ?? existingPlan.emergency_contacts,
      important_documents: body.important_documents ?? existingPlan.important_documents,
      emergency_bag_items: body.emergency_bag_items ?? existingPlan.emergency_bag_items,
      safe_place: body.safe_place ?? existingPlan.safe_place,
      digital_security: body.digital_security ?? existingPlan.digital_security,
      notes: body.notes ?? existingPlan.notes,
      updated_at: new Date().toISOString()
    }
    
    // Calcular novo status
    const newStatus = calculatePlanStatus(updatedData)
    
    const { data: updatedPlan, error } = await supabase
      .from('safety_plans')
      .update({
        ...updatedData,
        overall_status: newStatus
      })
      .eq('id', existingPlan.id)
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao atualizar plano:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar plano de segurança' },
        { status: 500 }
      )
    }
    
    // Criar entrada no diário
    await createDiaryEntry(supabase, user.id, false)
    
    return NextResponse.json({
      plan: updatedPlan,
      status: newStatus,
      message: 'Plano de segurança atualizado com sucesso'
    })
    
  } catch (error) {
    console.error('Erro no PATCH /api/safety-plan:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
