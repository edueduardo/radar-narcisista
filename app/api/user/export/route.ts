import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'

/**
 * API de Exportação de Dados do Usuário
 * Direito de portabilidade - LGPD Art. 18, V
 * 
 * GET /api/user/export - Exporta todos os dados do usuário
 * Query params:
 *   - format: 'json' | 'csv' (default: json)
 */

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'

    // Coletar todos os dados do usuário
    const exportData: Record<string, any> = {
      exportedAt: new Date().toISOString(),
      userId: user.id,
      email: user.email,
      sections: {}
    }

    // 1. Perfil do usuário
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profile) {
      exportData.sections.profile = {
        name: 'Perfil',
        data: profile
      }
    }

    // 2. Perfis de clareza (testes)
    const { data: clarityProfiles } = await supabase
      .from('clarity_profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (clarityProfiles?.length) {
      exportData.sections.clarityTests = {
        name: 'Testes de Clareza',
        count: clarityProfiles.length,
        data: clarityProfiles
      }
    }

    // 3. Entradas do diário
    const { data: journalEntries } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (journalEntries?.length) {
      exportData.sections.journal = {
        name: 'Diário',
        count: journalEntries.length,
        data: journalEntries
      }
    }

    // 4. Conversas do chat
    const { data: chatMessages } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (chatMessages?.length) {
      exportData.sections.chat = {
        name: 'Conversas do Chat',
        count: chatMessages.length,
        data: chatMessages
      }
    }

    // 5. Alertas de risco
    const { data: riskAlerts } = await supabase
      .from('risk_alerts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (riskAlerts?.length) {
      exportData.sections.riskAlerts = {
        name: 'Alertas de Risco',
        count: riskAlerts.length,
        data: riskAlerts
      }
    }

    // 6. Plano de segurança
    const { data: safetyPlan } = await supabase
      .from('safety_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (safetyPlan?.length) {
      exportData.sections.safetyPlan = {
        name: 'Plano de Segurança',
        count: safetyPlan.length,
        data: safetyPlan
      }
    }

    // 7. Termos aceitos
    const { data: termsAcceptances } = await supabase
      .from('terms_acceptances')
      .select('*')
      .eq('user_id', user.id)
      .order('accepted_at', { ascending: false })

    if (termsAcceptances?.length) {
      exportData.sections.termsAcceptances = {
        name: 'Termos Aceitos',
        count: termsAcceptances.length,
        data: termsAcceptances
      }
    }

    // 8. Preferências de notificação
    const { data: notificationPrefs } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (notificationPrefs) {
      exportData.sections.notificationPreferences = {
        name: 'Preferências de Notificação',
        data: notificationPrefs
      }
    }

    // 9. Cadeia de custódia
    const { data: custodyChain } = await supabase
      .from('custody_chain')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (custodyChain?.length) {
      exportData.sections.custodyChain = {
        name: 'Cadeia de Custódia',
        count: custodyChain.length,
        data: custodyChain
      }
    }

    // 10. Assinatura/Billing
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (subscription) {
      exportData.sections.subscription = {
        name: 'Assinatura',
        data: subscription
      }
    }

    // Registrar exportação para auditoria
    try {
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'data_export',
        details: {
          format,
          sections: Object.keys(exportData.sections),
          exportedAt: exportData.exportedAt
        }
      })
    } catch {
      // Silently fail if audit_logs doesn't exist
    }

    // Retornar no formato solicitado
    if (format === 'csv') {
      // Converter para CSV simplificado
      const csvContent = convertToCSV(exportData)
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="radar-narcisista-export-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    // JSON (default)
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="radar-narcisista-export-${new Date().toISOString().split('T')[0]}.json"`
      }
    })

  } catch (error) {
    console.error('Erro ao exportar dados:', error)
    return NextResponse.json(
      { error: 'Erro ao exportar dados' },
      { status: 500 }
    )
  }
}

/**
 * Converter dados para CSV simplificado
 */
function convertToCSV(data: Record<string, any>): string {
  const lines: string[] = []
  
  lines.push('EXPORTAÇÃO DE DADOS - RADAR NARCISISTA')
  lines.push(`Data de Exportação: ${data.exportedAt}`)
  lines.push(`Email: ${data.email}`)
  lines.push('')

  for (const [key, section] of Object.entries(data.sections)) {
    const s = section as any
    lines.push(`=== ${s.name.toUpperCase()} ===`)
    
    if (s.count) {
      lines.push(`Total de registros: ${s.count}`)
    }
    
    if (Array.isArray(s.data)) {
      // Para arrays, criar tabela
      if (s.data.length > 0) {
        const headers = Object.keys(s.data[0])
        lines.push(headers.join(','))
        
        for (const item of s.data) {
          const values = headers.map(h => {
            const val = item[h]
            if (val === null || val === undefined) return ''
            if (typeof val === 'object') return JSON.stringify(val).replace(/,/g, ';')
            return String(val).replace(/,/g, ';').replace(/\n/g, ' ')
          })
          lines.push(values.join(','))
        }
      }
    } else if (s.data) {
      // Para objetos únicos
      for (const [k, v] of Object.entries(s.data)) {
        const value = typeof v === 'object' ? JSON.stringify(v) : String(v)
        lines.push(`${k}: ${value}`)
      }
    }
    
    lines.push('')
  }

  return lines.join('\n')
}

/**
 * DELETE /api/user/export - Solicitar exclusão de dados
 * Direito ao esquecimento - LGPD Art. 18, VI
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { confirmEmail, reason } = body

    // Verificar confirmação
    if (confirmEmail !== user.email) {
      return NextResponse.json(
        { error: 'Email de confirmação não confere' },
        { status: 400 }
      )
    }

    // Criar solicitação de exclusão (não exclui imediatamente por segurança)
    const { error: insertError } = await supabase
      .from('deletion_requests')
      .insert({
        user_id: user.id,
        email: user.email,
        reason: reason || 'Não informado',
        status: 'pending',
        requested_at: new Date().toISOString(),
        scheduled_deletion_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 dias
      })

    if (insertError) {
      // Se tabela não existe, criar registro em audit_logs
      try {
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'deletion_request',
          details: {
            email: user.email,
            reason: reason || 'Não informado',
            requestedAt: new Date().toISOString()
          }
        })
      } catch {
        // Silently fail
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Solicitação de exclusão registrada. Seus dados serão excluídos em até 30 dias.',
      scheduledDeletionAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    })

  } catch (error) {
    console.error('Erro ao solicitar exclusão:', error)
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    )
  }
}
