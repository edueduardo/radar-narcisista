import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { 
  registerMobileDevice, 
  getMobileUserData, 
  syncOfflineData,
  getSyncData 
} from '@/lib/mobile-api'

/**
 * API Mobile
 * 
 * GET /api/mobile - Dados do usuário para app
 * POST /api/mobile - Registrar dispositivo
 * PUT /api/mobile - Sincronizar dados offline
 */

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'sync':
        // Buscar dados para sincronização
        const lastSync = searchParams.get('lastSync') || new Date(0).toISOString()
        const syncData = await getSyncData(user.id, lastSync, supabase)
        return NextResponse.json(syncData)

      case 'user':
      default:
        // Dados do usuário
        const userData = await getMobileUserData(user.id, supabase)
        if (!userData) {
          return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
        }
        return NextResponse.json(userData)
    }

  } catch (error) {
    console.error('Erro na API mobile:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'register':
        // Registrar dispositivo
        const { deviceId, platform, appVersion, pushToken, deviceModel, osVersion } = body

        if (!deviceId || !platform) {
          return NextResponse.json({ error: 'deviceId e platform são obrigatórios' }, { status: 400 })
        }

        const result = await registerMobileDevice(user.id, {
          deviceId,
          platform,
          appVersion,
          pushToken,
          deviceModel,
          osVersion
        }, supabase)

        return NextResponse.json({
          success: result.success,
          sessionId: result.sessionId
        })

      case 'updatePushToken':
        // Atualizar token de push
        const { error: tokenError } = await supabase
          .from('mobile_sessions')
          .update({ 
            push_token: body.pushToken,
            last_active: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('device_id', body.deviceId)

        return NextResponse.json({ success: !tokenError })

      case 'heartbeat':
        // Atualizar última atividade
        await supabase
          .from('mobile_sessions')
          .update({ last_active: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('device_id', body.deviceId)

        return NextResponse.json({ success: true, timestamp: new Date().toISOString() })

      default:
        return NextResponse.json({ error: 'Ação desconhecida' }, { status: 400 })
    }

  } catch (error) {
    console.error('Erro na API mobile:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { journalEntries, chatMessages } = body

    // Sincronizar dados offline
    const result = await syncOfflineData(user.id, {
      journalEntries,
      chatMessages
    }, supabase)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Erro na sincronização:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
