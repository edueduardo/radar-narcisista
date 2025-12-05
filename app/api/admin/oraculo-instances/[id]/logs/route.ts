/**
 * API de Logs de Uso
 * ETAPA 39 - Logs Detalhados de Uso
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { 
  listUsageLogs,
  getDailyStats,
  getUsageSummary,
  getRecentErrors,
  countLogs
} from '@/lib/oraculo-usage-logs'

// Cliente Supabase admin
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) return null
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Verificar se usuário é admin
async function isAdmin(userId: string): Promise<boolean> {
  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) return false
  
  const { data } = await supabaseAdmin
    .from('user_profiles')
    .select('role')
    .eq('user_id', userId)
    .single()
  
  return data?.role === 'ADMIN' || data?.role === 'SUPER_ADMIN'
}

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Busca logs e estatísticas
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    
    const supabase = await createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const userIsAdmin = await isAdmin(user.id)
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const view = searchParams.get('view') || 'logs' // logs, stats, summary, errors
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status') as 'success' | 'error' | 'rate_limited' | 'quota_exceeded' | null
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const apiKeyId = searchParams.get('api_key_id')
    const days = parseInt(searchParams.get('days') || '30')

    switch (view) {
      case 'stats': {
        const stats = await getDailyStats(id, days)
        return NextResponse.json({
          success: true,
          stats,
          period_days: days
        })
      }
      
      case 'summary': {
        const summary = await getUsageSummary(id, days)
        return NextResponse.json({
          success: true,
          summary,
          period_days: days
        })
      }
      
      case 'errors': {
        const errors = await getRecentErrors(id, limit)
        return NextResponse.json({
          success: true,
          errors,
          total: errors.length
        })
      }
      
      default: {
        // Lista de logs
        const logs = await listUsageLogs({
          instance_id: id,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          status: status || undefined,
          api_key_id: apiKeyId || undefined,
          limit,
          offset
        })
        
        const total = await countLogs(id, {
          status: status || undefined,
          start_date: startDate || undefined
        })
        
        return NextResponse.json({
          success: true,
          logs,
          total,
          limit,
          offset,
          has_more: offset + logs.length < total
        })
      }
    }

  } catch (error) {
    console.error('Erro ao buscar logs:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar logs' },
      { status: 500 }
    )
  }
}
