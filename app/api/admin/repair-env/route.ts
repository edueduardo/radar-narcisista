import { NextResponse } from 'next/server'
import { repararEnvAutomatico } from '../../../../lib/env-backup'

export async function POST() {
  try {
    console.log('🔧 API: Iniciando reparo do .env.local...')
    
    const resultado = repararEnvAutomatico()
    
    if (resultado) {
      console.log('✅ API: .env.local reparado com sucesso!')
      return NextResponse.json({ 
        success: true, 
        message: '.env.local reparado com sucesso!' 
      })
    } else {
      console.log('❌ API: Falha ao reparar .env.local')
      return NextResponse.json({ 
        success: false, 
        message: 'Falha ao reparar .env.local' 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('❌ API: Erro ao reparar .env.local:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno ao reparar .env.local' 
    }, { status: 500 })
  }
}
