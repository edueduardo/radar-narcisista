import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Criar tabela se não existir
    const { error: createTableError } = await supabase.rpc('create_frontpage_config_table')
    
    // Buscar configurações
    const { data, error } = await supabase
      .from('frontpage_config')
      .select('*')
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      throw error
    }

    return NextResponse.json({ 
      success: true, 
      config: data?.config || null 
    })
  } catch (error) {
    console.error('Erro ao buscar configurações:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao buscar configurações' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { config } = await request.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Criar tabela se não existir
    const { error: createTableError } = await supabase.rpc('create_frontpage_config_table')

    // Salvar configurações
    const { data, error } = await supabase
      .from('frontpage_config')
      .upsert({ 
        id: 'main', 
        config,
        updated_at: new Date().toISOString()
      })
      .select()

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      data 
    })
  } catch (error) {
    console.error('Erro ao salvar configurações:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao salvar configurações' 
    }, { status: 500 })
  }
}
