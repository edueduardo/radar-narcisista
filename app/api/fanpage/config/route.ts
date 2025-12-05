import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * API de Configuração da Fanpage - FANPAGE VIVA
 * 
 * GET /api/fanpage/config - Busca configuração dos blocos
 * PUT /api/fanpage/config - Atualiza configuração (admin)
 */

// GET - Busca configuração dos blocos
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { searchParams } = new URL(request.url)
    
    const enabledOnly = searchParams.get('enabled') === 'true'
    
    // Verificar se é admin
    const { data: { user } } = await supabase.auth.getUser()
    let isAdmin = false
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      isAdmin = profile?.role === 'admin'
    }
    
    let query = supabase
      .from('fanpage_config')
      .select('*')
    
    // Não-admins só veem blocos habilitados
    if (!isAdmin || enabledOnly) {
      query = query.eq('enabled', true)
    }
    
    query = query.order('display_order', { ascending: true })
    
    const { data, error } = await query
    
    if (error) {
      console.error('Erro ao buscar config:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar configuração', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data || [])
    
  } catch (error) {
    console.error('Erro na API de config:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualiza configuração (admin only)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }
    
    // Verificar se é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }
    
    const body = await request.json()
    
    // Pode ser update de um bloco ou batch update
    if (Array.isArray(body)) {
      // Batch update
      const results = []
      
      for (const block of body) {
        if (!block.block_key) continue
        
        const updateData: Record<string, any> = {}
        
        const allowedFields = [
          'title', 'description', 'icon', 'enabled',
          'display_order', 'max_items', 'refresh_interval_minutes',
          'source', 'config'
        ]
        
        for (const field of allowedFields) {
          if (block[field] !== undefined) {
            updateData[field] = block[field]
          }
        }
        
        const { data, error } = await supabase
          .from('fanpage_config')
          .update(updateData)
          .eq('block_key', block.block_key)
          .select()
          .single()
        
        if (!error && data) {
          results.push(data)
        }
      }
      
      return NextResponse.json(results)
      
    } else {
      // Single update
      const { block_key, ...updateData } = body
      
      if (!block_key) {
        return NextResponse.json({ error: 'block_key é obrigatório' }, { status: 400 })
      }
      
      const allowedFields = [
        'title', 'description', 'icon', 'enabled',
        'display_order', 'max_items', 'refresh_interval_minutes',
        'source', 'config'
      ]
      
      const filteredData: Record<string, any> = {}
      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field]
        }
      }
      
      const { data, error } = await supabase
        .from('fanpage_config')
        .update(filteredData)
        .eq('block_key', block_key)
        .select()
        .single()
      
      if (error) {
        console.error('Erro ao atualizar config:', error)
        return NextResponse.json(
          { error: 'Erro ao atualizar configuração', details: error.message },
          { status: 500 }
        )
      }
      
      return NextResponse.json(data)
    }
    
  } catch (error) {
    console.error('Erro na API de config:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
