import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { requireAdminAPI } from '@/lib/admin-auth'
import { generateEpisodeHash } from '@/lib/hash-utils'

// POST - Gerar hash para episódio
export async function POST(request: Request) {
  const auth = await requireAdminAPI(request)
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: 401 }
    )
  }

  try {
    const { episodeId } = await request.json()

    if (!episodeId) {
      return NextResponse.json(
        { success: false, error: 'episodeId é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar episódio
    const { data: episode, error: episodeError } = await supabaseAdmin
      .from('episodes')
      .select('*')
      .eq('id', episodeId)
      .single()

    if (episodeError || !episode) {
      return NextResponse.json(
        { success: false, error: 'Episódio não encontrado' },
        { status: 404 }
      )
    }

    // Gerar hash
    const hash = generateEpisodeHash(episode)

    // Verificar se já existe
    const { data: existing } = await supabaseAdmin
      .from('episode_hashes')
      .select('id')
      .eq('episode_id', episodeId)
      .single()

    if (existing) {
      // Atualizar hash existente
      const { error: updateError } = await supabaseAdmin
        .from('episode_hashes')
        .update({ hash_sha256: hash })
        .eq('episode_id', episodeId)

      if (updateError) throw updateError
    } else {
      // Inserir novo hash
      const { error: insertError } = await supabaseAdmin
        .from('episode_hashes')
        .insert({
          episode_id: episodeId,
          hash_sha256: hash
        })

      if (insertError) throw insertError
    }

    return NextResponse.json({
      success: true,
      data: {
        episodeId,
        hash,
        message: 'Hash SHA-256 gerado com sucesso'
      }
    })

  } catch (error) {
    console.error('Erro ao gerar hash:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao gerar hash' },
      { status: 500 }
    )
  }
}

// GET - Verificar hash de episódio
export async function GET(request: Request) {
  const auth = await requireAdminAPI(request)
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const episodeId = searchParams.get('episodeId')
    const hash = searchParams.get('hash')

    if (episodeId) {
      // Buscar hash pelo ID do episódio
      const { data, error } = await supabaseAdmin
        .from('episode_hashes')
        .select('*')
        .eq('episode_id', episodeId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json({
            success: true,
            data: null,
            message: 'Hash não encontrado para este episódio'
          })
        }
        throw error
      }

      return NextResponse.json({
        success: true,
        data
      })
    }

    if (hash) {
      // Buscar episódio pelo hash
      const { data, error } = await supabaseAdmin
        .from('episode_hashes')
        .select(`
          *,
          episodes (
            id,
            user_id,
            title,
            content,
            created_at
          )
        `)
        .eq('hash_sha256', hash)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json({
            success: true,
            data: null,
            message: 'Episódio não encontrado para este hash'
          })
        }
        throw error
      }

      return NextResponse.json({
        success: true,
        data
      })
    }

    return NextResponse.json(
      { success: false, error: 'episodeId ou hash é obrigatório' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Erro ao verificar hash:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao verificar hash' },
      { status: 500 }
    )
  }
}
