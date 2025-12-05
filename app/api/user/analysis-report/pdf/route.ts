import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server-compat'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import PDFDocument from 'pdfkit'

// Função para calcular hash SHA-256
function calculateSHA256(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

// Função para formatar data em português
function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Gerar PDF do relatório
async function generateReportPDF(analysis: any, user: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: 'Análise Colaborativa - Radar Narcisista',
        Author: 'Radar Narcisista',
        Subject: 'Relatório de Análise Emocional',
        Keywords: 'análise, emocional, clareza, radar narcisista'
      }
    })

    const chunks: Uint8Array[] = []
    doc.on('data', (chunk: Uint8Array) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const now = new Date()

    // === CABEÇALHO ===
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#6B21A8')
       .text('RADAR NARCISISTA', { align: 'center' })
    doc.fontSize(14).font('Helvetica').fillColor('#374151')
       .text('Análise Colaborativa', { align: 'center' })
    doc.moveDown()
    doc.fontSize(10).fillColor('#6B7280')
       .text(`Gerado em: ${formatDate(now)}`, { align: 'center' })
       .text(`Usuário: ${user.email || 'Não identificado'}`, { align: 'center' })
    doc.moveDown(2)

    // === AVISO IMPORTANTE ===
    doc.rect(50, doc.y, 495, 80).fill('#FEF3C7')
    const avisoY = doc.y - 70
    doc.fillColor('#92400E').fontSize(12).font('Helvetica-Bold')
       .text('AVISO IMPORTANTE', 60, avisoY)
    doc.fontSize(10).font('Helvetica')
       .text('Este documento é uma ferramenta de CLAREZA EMOCIONAL e autoconhecimento.', 60)
       .text('NÃO constitui laudo médico, psicológico ou jurídico.', 60)
       .text('NÃO substitui avaliação profissional de saúde mental.', 60)
    doc.moveDown(3)

    // === RESUMO DA ANÁLISE ===
    doc.fillColor('#1F2937').fontSize(16).font('Helvetica-Bold')
       .text('RESUMO DA ANÁLISE')
    doc.moveDown()

    // Padrões identificados
    if (analysis.patterns) {
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#6B21A8')
         .text('Padrões Identificados:')
      doc.fontSize(11).font('Helvetica').fillColor('#374151')
         .text(String(analysis.patterns))
      doc.moveDown()
    }

    // Estado emocional
    if (analysis.emotional_state) {
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#6B21A8')
         .text('Estado Emocional Percebido:')
      doc.fontSize(11).font('Helvetica').fillColor('#374151')
         .text(String(analysis.emotional_state))
      doc.moveDown()
    }

    // Nível de impacto
    if (analysis.impact_level) {
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#6B21A8')
         .text('Nível de Impacto:')
      doc.fontSize(11).font('Helvetica').fillColor('#374151')
         .text(String(analysis.impact_level))
      doc.moveDown()
    }

    // Recomendações
    if (analysis.recommendations) {
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#6B21A8')
         .text('Recomendações:')
      doc.fontSize(11).font('Helvetica').fillColor('#374151')
         .text(String(analysis.recommendations))
      doc.moveDown()
    }

    // === SOBRE ESTA ANÁLISE ===
    doc.moveDown()
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1F2937')
       .text('SOBRE ESTA ANÁLISE')
    doc.moveDown(0.5)
    doc.fontSize(10).font('Helvetica').fillColor('#6B7280')
       .text('Esta análise foi gerada por um sistema de Inteligência Artificial que utiliza múltiplas camadas de processamento:')
    doc.moveDown(0.5)
    doc.text('1. Análise Inicial: Leitura e compreensão do contexto relatado')
       .text('2. Votação: Diferentes modelos de IA avaliam a situação')
       .text('3. Consenso: Síntese das avaliações para resultado equilibrado')
       .text('4. Transparência: Explicação clara do processo e limitações')
    doc.moveDown()
    doc.text('O objetivo é ajudar você a organizar seus pensamentos, NÃO fazer diagnósticos.')

    // === RODAPÉ ===
    doc.moveDown(2)
    doc.fontSize(9).fillColor('#9CA3AF')
       .text('─'.repeat(80), { align: 'center' })
    doc.text('Radar Narcisista - Ferramenta de Clareza Emocional', { align: 'center' })
    doc.text('Em caso de emergência: CVV 188 | Ligue 180 | Polícia 190', { align: 'center' })

    // Finalizar PDF
    doc.end()
  })
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = await createRouteHandlerClient()

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Receber dados da análise
    const body = await request.json()
    const { analysisId, analysisData } = body

    if (!analysisData) {
      return NextResponse.json(
        { error: 'Dados da análise não fornecidos' },
        { status: 400 }
      )
    }

    // Gerar PDF do relatório
    const pdfBuffer = await generateReportPDF(analysisData, user)

    // Calcular hash SHA-256
    const sha256Hash = calculateSHA256(pdfBuffer)

    // Salvar hash no banco de dados
    const { error: dbError } = await supabase
      .from('document_hashes')
      .insert({
        user_id: user.id,
        document_type: 'ANALISE_COLABORATIVA',
        sha256_hash: sha256Hash,
        metadata: {
          analysis_id: analysisId,
          app_version: '1.0.0',
          language: 'pt-BR',
          generated_by: 'api/user/analysis-report/pdf'
        }
      })

    if (dbError) {
      console.error('Erro ao salvar hash:', dbError)
      // Continua mesmo se falhar o salvamento do hash
    }

    // Retornar PDF real
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="analise-colaborativa-${new Date().toISOString().split('T')[0]}.pdf"`,
        'X-SHA256-Hash': sha256Hash
      }
    })

  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
    return NextResponse.json(
      { error: 'Erro interno ao gerar relatório' },
      { status: 500 }
    )
  }
}

// Endpoint para verificar hash de um documento
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = await createRouteHandlerClient()

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Buscar hashes do usuário
    const { data: hashes, error: dbError } = await supabase
      .from('document_hashes')
      .select('*')
      .eq('user_id', user.id)
      .eq('document_type', 'ANALISE_COLABORATIVA')
      .order('generated_at', { ascending: false })
      .limit(10)

    if (dbError) {
      throw dbError
    }

    return NextResponse.json({
      success: true,
      hashes: hashes || []
    })

  } catch (error) {
    console.error('Erro ao buscar hashes:', error)
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    )
  }
}
