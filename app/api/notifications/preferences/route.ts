// API de Preferências de Notificação
// /api/notifications/preferences

import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// GET - Buscar preferências
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: prefs, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      // Se tabela não existe, retornar defaults
      if (error.code === '42P01') {
        return NextResponse.json({
          preferences: getDefaultPreferences(user.id)
        })
      }
      throw error
    }

    return NextResponse.json({
      preferences: prefs || getDefaultPreferences(user.id)
    })

  } catch (error) {
    console.error('Erro ao buscar preferências:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar preferências
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      email_enabled,
      push_enabled,
      in_app_enabled,
      risk_alerts,
      journal_reminders,
      weekly_summary,
      marketing
    } = body

    // Upsert preferências
    const { data: prefs, error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        email_enabled: email_enabled ?? true,
        push_enabled: push_enabled ?? true,
        in_app_enabled: in_app_enabled ?? true,
        risk_alerts: risk_alerts ?? true,
        journal_reminders: journal_reminders ?? true,
        weekly_summary: weekly_summary ?? true,
        marketing: marketing ?? false,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (error) {
      // Se tabela não existe, retornar sucesso simulado
      if (error.code === '42P01') {
        return NextResponse.json({
          preferences: { ...body, user_id: user.id },
          source: 'simulated'
        })
      }
      throw error
    }

    return NextResponse.json({ preferences: prefs })

  } catch (error) {
    console.error('Erro ao atualizar preferências:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Helper - Preferências padrão
function getDefaultPreferences(userId: string) {
  return {
    user_id: userId,
    email_enabled: true,
    push_enabled: true,
    in_app_enabled: true,
    risk_alerts: true,
    journal_reminders: true,
    weekly_summary: true,
    marketing: false
  }
}
