import { NextRequest, NextResponse } from 'next/server'
import { transcribeAudio } from '../../../../lib/openai'
import { supabase, supabaseAdmin } from '../../../../lib/supabaseClient'
import { analyzePatterns } from '../../../../lib/openai'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Verificar configurações de LGPD do usuário
    let { data: settings } = await supabase
      .from('user_settings')
      .select('save_voice_audio, allow_ai_learning_product')
      .eq('user_id', user.id)
      .single()

    // Se não existir configurações, criar defaults para o usuário
    if (!settings) {
      console.log('Criando configurações default para usuário:', user.id)
      
      // Tentar com admin primeiro, se não funcionar, usar defaults direto
      let newSettings = null
      let insertError = null
      
      if (supabaseAdmin !== supabase) {
        const result = await supabaseAdmin
          .from('user_settings')
          .insert({
            user_id: user.id,
            save_voice_audio: false,  // Default: não salvar áudio
            allow_ai_learning_product: true  // Default: permitir análise
          })
          .select('save_voice_audio, allow_ai_learning_product')
          .single()
        
        newSettings = result.data
        insertError = result.error
      }

      if (insertError || !newSettings) {
        console.log('Não foi possível criar configurações (RLS), usando defaults temporários')
        // Usar configurações padrão temporárias
        newSettings = {
          save_voice_audio: false,
          allow_ai_learning_product: true
        }
      }

      settings = newSettings
    }

    // Obter arquivo de áudio
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    
    if (!audioFile) {
      return NextResponse.json({ error: 'Arquivo de áudio não encontrado' }, { status: 400 })
    }

    // Limitar tamanho do arquivo (10MB)
    if (audioFile.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande (máximo 10MB)' }, { status: 400 })
    }

    // Transcrever áudio
    const transcription = await transcribeAudio(audioFile)

    // Detectar crise aguda na transcrição
    const crisisKeywords = [
      'suicídio', 'matar', 'morrer', 'acabar com tudo', 'não aguento mais',
      'querer morrer', 'fim da vida', 'acabar com minha vida', 'me matar'
    ]
    
    const hasCrisisKeywords = crisisKeywords.some(keyword => 
      transcription.toLowerCase().includes(keyword)
    )

    // Se houver crise, registrar evento e retornar ajuda
    if (hasCrisisKeywords) {
      // Registrar evento de crise
      await supabase.from('ai_events').insert({
        user_id: user.id,
        source: 'voice_transcription',
        event_type: 'CRISIS_DETECTED',
        payload: {
          transcription_length: transcription.length,
          keywords_detected: crisisKeywords.filter(k => transcription.toLowerCase().includes(k)),
          timestamp: new Date().toISOString()
        }
      })

      return NextResponse.json({
        transcription,
        crisis_detected: true,
        message: 'Detectamos sinais de crise. Por favor, procure ajuda imediata. Ligue 188 (CVV) ou 190 em caso de emergência.',
        emergency_contacts: {
          cvv: '188',
          police: '190',
          samu: '192'
        }
      })
    }

    // Análise de padrões se usuário permitiu
    let patterns = null
    if (settings.allow_ai_learning_product) {
      patterns = await analyzePatterns(transcription)
      
      // Registrar evento derivado (sem o texto completo)
      await supabase.from('ai_events').insert({
        user_id: user.id,
        source: 'voice_transcription',
        event_type: 'PATTERN_ANALYSIS',
        payload: {
          themes: patterns.themes,
          emotions: patterns.emotions,
          intensity: patterns.intensity,
          risk_flags: patterns.risk_flags
        }
      })
    }

    // Salvar áudio se usuário permitiu (futuro - implementar storage)
    if (settings.save_voice_audio) {
      // TODO: Implementar salvamento no Supabase Storage
      console.log('Áudio seria salvo se storage estivesse configurado')
    }

    return NextResponse.json({
      transcription,
      patterns,
      from_voice: true,
      crisis_detected: false
    })

  } catch (error) {
    console.error('Erro na transcrição:', error)
    
    if (error instanceof Error) {
      // Erro de API key
      if (error.message.includes('API key') || error.message.includes('Unauthorized')) {
        return NextResponse.json({ 
          error: 'Serviço de transcrição não configurado. Contate o suporte.' 
        }, { status: 503 })
      }
      
      // Erro de OpenAI
      if (error.message.includes('OpenAI') || error.message.includes('transcrição')) {
        return NextResponse.json({ 
          error: 'Erro no serviço de transcrição. Tente novamente.' 
        }, { status: 503 })
      }
      
      // Erro de formato de áudio
      if (error.message.includes('audio') || error.message.includes('format')) {
        return NextResponse.json({ 
          error: 'Formato de áudio não suportado. Tente gravar novamente.' 
        }, { status: 400 })
      }
    }
    
    return NextResponse.json({ 
      error: 'Erro interno do servidor. Tente novamente ou use o teclado.' 
    }, { status: 500 })
  }
}
