// API de Cadeia de Custódia
// /api/custody

import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import {
  createCustodyMetadata,
  verifyCustodyEntry,
  generateCustodyReport,
  formatHashForDisplay,
  CustodyEntry,
  CustodyMetadata
} from '@/lib/chain-of-custody'

// GET - Verificar integridade ou exportar relatório
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'summary'
    const entryType = searchParams.get('type')
    const entryId = searchParams.get('id')

    // Verificar entrada específica
    if (action === 'verify' && entryId) {
      return await verifyEntry(supabase, user.id, entryId, entryType)
    }

    // Gerar relatório completo
    if (action === 'report') {
      return await generateReport(supabase, user.id, entryType)
    }

    // Resumo da cadeia
    return await getCustodySummary(supabase, user.id)

  } catch (error) {
    console.error('Erro na API de custódia:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Registrar hash de nova entrada
export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { entryId, entryType, content } = body

    if (!entryId || !entryType || !content) {
      return NextResponse.json(
        { error: 'entryId, entryType e content são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar último hash do usuário para encadeamento
    const { data: lastEntry } = await supabase
      .from('custody_chain')
      .select('hash')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const previousHash = lastEntry?.hash

    // Criar metadados de custódia
    const metadata = createCustodyMetadata(
      content,
      user.id,
      entryType,
      previousHash
    )

    // Salvar na tabela de custódia
    const { data: custodyRecord, error: insertError } = await supabase
      .from('custody_chain')
      .insert({
        user_id: user.id,
        entry_id: entryId,
        entry_type: entryType,
        hash: metadata.hash,
        previous_hash: metadata.previousHash,
        hash_version: metadata.version,
        created_at: metadata.timestamp
      })
      .select()
      .single()

    if (insertError) {
      // Se tabela não existe, retornar hash sem persistir
      if (insertError.code === '42P01') {
        return NextResponse.json({
          success: true,
          hash: metadata.hash,
          hashDisplay: formatHashForDisplay(metadata.hash),
          timestamp: metadata.timestamp,
          source: 'computed_only',
          message: 'Hash gerado mas não persistido (tabela não existe)'
        })
      }
      throw insertError
    }

    return NextResponse.json({
      success: true,
      hash: metadata.hash,
      hashDisplay: formatHashForDisplay(metadata.hash),
      timestamp: metadata.timestamp,
      previousHash: metadata.previousHash,
      recordId: custodyRecord?.id
    })

  } catch (error) {
    console.error('Erro ao registrar custódia:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Funções auxiliares

async function verifyEntry(
  supabase: any,
  userId: string,
  entryId: string,
  entryType: string | null
) {
  // Buscar registro de custódia
  let query = supabase
    .from('custody_chain')
    .select('*')
    .eq('user_id', userId)
    .eq('entry_id', entryId)

  if (entryType) {
    query = query.eq('entry_type', entryType)
  }

  const { data: custodyRecord, error } = await query.single()

  if (error || !custodyRecord) {
    return NextResponse.json({
      verified: false,
      error: 'Registro de custódia não encontrado'
    })
  }

  // Buscar conteúdo original baseado no tipo
  let originalContent = null
  
  if (custodyRecord.entry_type === 'journal_entry') {
    const { data } = await supabase
      .from('journal_entries')
      .select('description, title, tags')
      .eq('id', entryId)
      .single()
    
    if (data) {
      originalContent = JSON.stringify({
        title: data.title,
        description: data.description,
        tags: data.tags
      })
    }
  }

  if (!originalContent) {
    return NextResponse.json({
      verified: false,
      hash: custodyRecord.hash,
      hashDisplay: formatHashForDisplay(custodyRecord.hash),
      timestamp: custodyRecord.created_at,
      message: 'Conteúdo original não encontrado para verificação'
    })
  }

  // Verificar integridade
  const metadata: CustodyMetadata = {
    hash: custodyRecord.hash,
    timestamp: custodyRecord.created_at,
    version: custodyRecord.hash_version,
    userId: custodyRecord.user_id,
    entryType: custodyRecord.entry_type,
    previousHash: custodyRecord.previous_hash
  }

  const verification = verifyCustodyEntry(originalContent, metadata)

  return NextResponse.json({
    verified: verification.isValid,
    hash: custodyRecord.hash,
    hashDisplay: formatHashForDisplay(custodyRecord.hash),
    timestamp: custodyRecord.created_at,
    details: verification.details
  })
}

async function generateReport(
  supabase: any,
  userId: string,
  entryType: string | null
) {
  let query = supabase
    .from('custody_chain')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (entryType) {
    query = query.eq('entry_type', entryType)
  }

  const { data: records, error } = await query

  if (error) {
    return NextResponse.json({ error: 'Erro ao buscar registros' }, { status: 500 })
  }

  // Converter para formato de relatório
  const entries: CustodyEntry[] = (records || []).map((r: any) => ({
    id: r.entry_id,
    content: '', // Não incluir conteúdo no relatório por segurança
    metadata: {
      hash: r.hash,
      timestamp: r.created_at,
      version: r.hash_version,
      userId: r.user_id,
      entryType: r.entry_type,
      previousHash: r.previous_hash
    }
  }))

  const report = generateCustodyReport(entries)

  return new NextResponse(report, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="cadeia-custodia-${new Date().toISOString().split('T')[0]}.json"`
    }
  })
}

async function getCustodySummary(supabase: any, userId: string) {
  // Contar registros por tipo
  const { data: records } = await supabase
    .from('custody_chain')
    .select('entry_type, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (!records || records.length === 0) {
    return NextResponse.json({
      totalEntries: 0,
      byType: {},
      lastEntry: null,
      chainStatus: 'empty'
    })
  }

  // Agregar por tipo
  const byType: Record<string, number> = {}
  for (const record of records) {
    byType[record.entry_type] = (byType[record.entry_type] || 0) + 1
  }

  return NextResponse.json({
    totalEntries: records.length,
    byType,
    lastEntry: records[0]?.created_at,
    chainStatus: 'active'
  })
}
