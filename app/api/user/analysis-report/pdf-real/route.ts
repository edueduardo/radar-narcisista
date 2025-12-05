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

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = await createRouteHandlerClient()

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Receber dados da análise
    const body = await request.json()
    const { analysisData } = body

    if (!analysisData) {
      return NextResponse.json({ error: 'Dados da análise não fornecidos' }, { status: 400 })
    }

    // Criar PDF
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

    // Coletar chunks do PDF
    const chunks: Uint8Array[] = []
    doc.on('data', (chunk: Uint8Array) => chunks.push(chunk))

    // Promessa para quando o PDF terminar
    const pdfPromise = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)))
    })

    const now = new Date()

    // === CABEÇALHO ===
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#6B21A8')
       .text('RADAR NARCISISTA', { align: 'center' })
    doc.fontSize(14).font('Helvetica').fillColor('#374151')
       .text('Análise Colaborativa', { align: 'center' })
    doc.moveDown()
    doc.fontSize(10).fillColor('#6B7280')
       .text(`Gerado em: ${formatDate(now)}`, { align: 'center' })
    doc.moveDown(2)

    // === AVISO IMPORTANTE ===
    doc.rect(50, doc.y, 495, 80).fill('#FEF3C7')
    doc.fillColor('#92400E').fontSize(12).font('Helvetica-Bold')
       .text('⚠️ AVISO IMPORTANTE', 60, doc.y - 70)
    doc.fontSize(10).font('Helvetica')
       .text('Este documento é uma ferramenta de CLAREZA EMOCIONAL e autoconhecimento.', 60)
       .text('NÃO constitui laudo médico, psicológico ou jurídico.', 60)
       .text('NÃO substitui avaliação profissional de saúde mental.', 60)
    doc.moveDown(3)

    // === RESUMO DA ANÁLISE ===
    doc.fillColor('#1F2937').fontSize(16).font('Helvetica-Bold')
       .text('📊 RESUMO DA ANÁLISE')
    doc.moveDown()

    // Padrões identificados
    if (analysisData.themes && analysisData.themes.length > 0) {
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#6B21A8')
         .text('Padrões Identificados:')
      doc.fontSize(11).font('Helvetica').fillColor('#374151')
         .text(analysisData.themes.join(', '))
      doc.moveDown()
    }

    // Estado emocional
    if (analysisData.emotions && analysisData.emotions.length > 0) {
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#6B21A8')
         .text('Estado Emocional Detectado:')
      doc.fontSize(11).font('Helvetica').fillColor('#374151')
         .text(analysisData.emotions.join(', '))
      doc.moveDown()
    }

    // Nível de impacto
    if (analysisData.intensity !== undefined) {
      const intensityPercent = Math.round(analysisData.intensity * 100)
      const intensityLevel = intensityPercent < 30 ? 'Baixo' : intensityPercent < 70 ? 'Médio' : 'Alto'
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#6B21A8')
         .text('Nível de Impacto Emocional:')
      doc.fontSize(11).font('Helvetica').fillColor('#374151')
         .text(`${intensityPercent}% - ${intensityLevel}`)
      doc.moveDown()
    }

    // Recomendações
    if (analysisData.suggestions && analysisData.suggestions.length > 0) {
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#6B21A8')
         .text('Recomendações:')
      analysisData.suggestions.forEach((suggestion: string) => {
        doc.fontSize(11).font('Helvetica').fillColor('#374151')
           .text(`• ${suggestion}`)
      })
      doc.moveDown()
    }

    // Confiabilidade
    if (analysisData.metadados_colaborativos) {
      const meta = analysisData.metadados_colaborativos
      doc.moveDown()
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#6B21A8')
         .text('🎛️ Confiabilidade do Sistema:')
      doc.fontSize(11).font('Helvetica').fillColor('#374151')
         .text(`• ${meta.total_ias || 0} IAs analisaram`)
         .text(`• Taxa de consenso: ${Math.round((meta.taxa_consenso || 0) * 100)}%`)
         .text(`• ${meta.validacoes || 0} validações realizadas`)
      doc.moveDown()
    }

    // === SOBRE ESTE RELATÓRIO ===
    doc.moveDown()
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1F2937')
       .text('📋 SOBRE ESTE RELATÓRIO')
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
    doc.text('Em caso de emergência: CVV 188 | Polícia 190', { align: 'center' })

    // Finalizar PDF
    doc.end()

    // Aguardar PDF ser gerado
    const pdfBuffer = await pdfPromise

    // Calcular hash SHA-256
    const sha256Hash = calculateSHA256(pdfBuffer)

    // Salvar hash no banco de dados
    try {
      await supabase.from('document_hashes').insert({
        user_id: user.id,
        document_type: 'ANALISE_COLABORATIVA',
        sha256_hash: sha256Hash,
        metadata: {
          app_version: '1.0.0',
          language: 'pt-BR',
          generated_by: 'api/user/analysis-report/pdf-real'
        }
      })
    } catch (dbError) {
      console.error('Erro ao salvar hash (continuando):', dbError)
    }

    // Retornar PDF
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="analise-colaborativa-${now.toISOString().split('T')[0]}.pdf"`,
        'X-SHA256-Hash': sha256Hash
      }
    })

  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    return NextResponse.json({ error: 'Erro interno ao gerar PDF' }, { status: 500 })
  }
}
