/**
 * GERADOR DE PDF PROFISSIONAL - RADAR NARCISISTA
 * Gera relatórios em PDF para terapia, advogados e uso pessoal
 * 
 * BACKUP: Criado em 24/11/2025 22:35
 * ATUALIZADO: 25/11/2025 - Adicionado Hash SHA-256 para integridade
 * LOCAL: lib/pdf-generator.tsx
 */

import React from 'react'
import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer'
import { supabase } from './supabaseClient'

// ============================================
// HASH SHA-256 PARA INTEGRIDADE DE DOCUMENTOS
// ============================================

/**
 * Gera hash SHA-256 de um ArrayBuffer
 */
async function generateSHA256(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

/**
 * Gera hash SHA-256 de um Blob
 */
export async function generateBlobHash(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer()
  return generateSHA256(buffer)
}

/**
 * Metadados do documento com hash
 */
export interface DocumentMetadata {
  id: string
  type: 'CLARITY_TEST' | 'JOURNAL' | 'COMPLETE_REPORT' | 'PROFESSIONAL_SUMMARY'
  sha256Hash: string
  generatedAt: string
  generatedAtUTC: string
  userId?: string
}

// ============================================
// ESTILOS DO PDF
// ============================================

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #7C3AED',
    paddingBottom: 15,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginBottom: 10,
    marginTop: 15,
    borderBottom: '1 solid #E5E7EB',
    paddingBottom: 5,
  },
  text: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 5,
    lineHeight: 1.5,
  },
  boldText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: '30%',
    fontSize: 10,
    color: '#6B7280',
  },
  value: {
    width: '70%',
    fontSize: 11,
    color: '#1F2937',
  },
  card: {
    backgroundColor: '#F9FAFB',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    border: '1 solid #E5E7EB',
  },
  alertCard: {
    backgroundColor: '#FEF2F2',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    border: '1 solid #FECACA',
  },
  warningCard: {
    backgroundColor: '#FFFBEB',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    border: '1 solid #FDE68A',
  },
  successCard: {
    backgroundColor: '#ECFDF5',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    border: '1 solid #A7F3D0',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#9CA3AF',
    borderTop: '1 solid #E5E7EB',
    paddingTop: 10,
  },
  disclaimer: {
    fontSize: 9,
    color: '#9CA3AF',
    marginTop: 20,
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 5,
  },
  scoreBar: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    marginTop: 5,
    marginBottom: 10,
  },
  scoreBarFill: {
    height: 10,
    borderRadius: 5,
  },
  table: {
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #E5E7EB',
    paddingVertical: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    borderBottom: '2 solid #E5E7EB',
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    color: '#374151',
  },
  tableCellHeader: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  badge: {
    backgroundColor: '#7C3AED',
    color: '#FFFFFF',
    padding: '3 8',
    borderRadius: 10,
    fontSize: 9,
  },
  badgeRed: {
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    padding: '3 8',
    borderRadius: 10,
    fontSize: 9,
  },
  badgeYellow: {
    backgroundColor: '#F59E0B',
    color: '#FFFFFF',
    padding: '3 8',
    borderRadius: 10,
    fontSize: 9,
  },
  badgeGreen: {
    backgroundColor: '#10B981',
    color: '#FFFFFF',
    padding: '3 8',
    borderRadius: 10,
    fontSize: 9,
  },
})

// ============================================
// TIPOS
// ============================================

export interface RelatorioTesteData {
  data: string
  scores: {
    nevoa: number
    medo: number
    limites: number
    total: number
  }
  zona: 'ATENCAO' | 'ALERTA' | 'VERMELHA'
  interpretacao: {
    nevoa: string
    medo: string
    limites: string
    global: string
  }
}

export interface RelatorioDiarioData {
  periodo: string
  totalEntradas: number
  entradas: {
    data: string
    titulo: string
    contexto: string
    impacto: number
    tags: string[]
    resumo: string
  }[]
  padroes: string[]
  emocoes: string[]
}

export interface RelatorioCompletoData {
  usuario: {
    nome?: string
    email?: string
  }
  dataGeracao: string
  teste?: RelatorioTesteData
  diario?: RelatorioDiarioData
  analiseIA?: {
    padroes: string[]
    alertas: string[]
    sugestoes: string[]
    intensidadeMedia: number
  }
}

// ============================================
// RELATÓRIO PARA PROFISSIONAL (TERAPEUTA/ADVOGADO)
// ============================================

export interface RelatorioProfissionalData {
  destinatario: {
    tipo: 'terapeuta' | 'advogado' | 'outro'
    nome?: string
  }
  paciente: {
    identificador: string // Pode ser anônimo
    idade?: number
    genero?: string
  }
  dataGeracao: string
  periodoAnalise: {
    inicio: string
    fim: string
  }
  resumoExecutivo: {
    totalEpisodios: number
    episodiosAltoImpacto: number
    impactoMedio: number
    diasComRegistro: number
  }
  padroesIdentificados: {
    categoria: string
    padroes: string[]
    frequencia: number
    tendencia: 'aumentando' | 'estavel' | 'diminuindo'
  }[]
  cronologiaEpisodios: {
    data: string
    titulo: string
    contexto: string
    impacto: number
    tags: string[]
    descricaoNeutra: string // Sem linguagem emocional excessiva
  }[]
  observacoesAdicionais?: string
}

// ============================================
// COMPONENTES DO PDF
// ============================================

const Header = () => (
  <View style={styles.header}>
    <Text style={styles.logo}>🔍 Radar Narcisista</Text>
    <Text style={styles.subtitle}>Relatório Confidencial - Para Uso Profissional</Text>
  </View>
)

const Footer = ({ pageNumber, documentId, hash }: { pageNumber: number; documentId?: string; hash?: string }) => (
  <View style={styles.footer}>
    <Text>
      Este documento é confidencial e destinado exclusivamente ao uso do destinatário.
    </Text>
    {documentId && (
      <Text style={{ marginTop: 3, fontSize: 8 }}>
        ID: {documentId} | Gerado em: {new Date().toISOString()}
      </Text>
    )}
    {hash && (
      <Text style={{ marginTop: 2, fontSize: 7, fontFamily: 'Courier' }}>
        SHA-256: {hash.substring(0, 32)}...{hash.substring(hash.length - 8)}
      </Text>
    )}
    <Text style={{ marginTop: 3 }}>Página {pageNumber}</Text>
  </View>
)

const Disclaimer = () => (
  <View style={styles.disclaimer}>
    <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>⚠️ AVISO IMPORTANTE:</Text>
    <Text>
      Este relatório NÃO constitui diagnóstico clínico ou psiquiátrico. As informações aqui 
      contidas são baseadas em auto-relato e análise de padrões comportamentais. Para 
      diagnóstico e tratamento, consulte um profissional de saúde mental qualificado.
    </Text>
  </View>
)

const ScoreBar = ({ score, max, color }: { score: number; max: number; color: string }) => {
  const percentage = (score / max) * 100
  return (
    <View style={styles.scoreBar}>
      <View style={[styles.scoreBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
    </View>
  )
}

const getZonaColor = (zona: string) => {
  switch (zona) {
    case 'VERMELHA': return '#EF4444'
    case 'ALERTA': return '#F59E0B'
    case 'ATENCAO': return '#10B981'
    default: return '#6B7280'
  }
}

const getZonaLabel = (zona: string) => {
  switch (zona) {
    case 'VERMELHA': return 'Zona Vermelha - Alto Risco'
    case 'ALERTA': return 'Zona de Alerta'
    case 'ATENCAO': return 'Zona de Atenção'
    default: return zona
  }
}

// ============================================
// DOCUMENTO: RELATÓRIO DO TESTE DE CLAREZA
// ============================================

export const RelatorioTestePDF = ({ data }: { data: RelatorioTesteData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Header />
      
      <Text style={styles.title}>Relatório do Teste de Clareza</Text>
      <Text style={styles.text}>Data da avaliação: {data.data}</Text>
      
      {/* Resultado Global */}
      <View style={data.zona === 'VERMELHA' ? styles.alertCard : data.zona === 'ALERTA' ? styles.warningCard : styles.successCard}>
        <Text style={styles.boldText}>Resultado Global: {getZonaLabel(data.zona)}</Text>
        <Text style={styles.text}>Pontuação total: {data.scores.total}/48</Text>
      </View>
      
      {/* Scores por Eixo */}
      <Text style={styles.sectionTitle}>Análise por Eixo</Text>
      
      <View style={styles.card}>
        <Text style={styles.boldText}>🌫️ Névoa Mental (Gaslighting/Confusão)</Text>
        <Text style={styles.text}>Pontuação: {data.scores.nevoa}/16</Text>
        <ScoreBar score={data.scores.nevoa} max={16} color={data.scores.nevoa > 10 ? '#EF4444' : data.scores.nevoa > 5 ? '#F59E0B' : '#10B981'} />
        <Text style={styles.text}>{data.interpretacao.nevoa}</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.boldText}>😰 Medo e Tensão Constante</Text>
        <Text style={styles.text}>Pontuação: {data.scores.medo}/16</Text>
        <ScoreBar score={data.scores.medo} max={16} color={data.scores.medo > 10 ? '#EF4444' : data.scores.medo > 5 ? '#F59E0B' : '#10B981'} />
        <Text style={styles.text}>{data.interpretacao.medo}</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.boldText}>🚧 Desrespeito a Limites</Text>
        <Text style={styles.text}>Pontuação: {data.scores.limites}/16</Text>
        <ScoreBar score={data.scores.limites} max={16} color={data.scores.limites > 10 ? '#EF4444' : data.scores.limites > 5 ? '#F59E0B' : '#10B981'} />
        <Text style={styles.text}>{data.interpretacao.limites}</Text>
      </View>
      
      {/* Interpretação Global */}
      <Text style={styles.sectionTitle}>Interpretação Global</Text>
      <View style={styles.card}>
        <Text style={styles.text}>{data.interpretacao.global}</Text>
      </View>
      
      <Disclaimer />
      <Footer pageNumber={1} />
    </Page>
  </Document>
)

// ============================================
// DOCUMENTO: RELATÓRIO DO DIÁRIO
// ============================================

export const RelatorioDiarioPDF = ({ data }: { data: RelatorioDiarioData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Header />
      
      <Text style={styles.title}>Relatório do Diário de Episódios</Text>
      <Text style={styles.text}>Período: {data.periodo}</Text>
      <Text style={styles.text}>Total de entradas: {data.totalEntradas}</Text>
      
      {/* Padrões Identificados */}
      {data.padroes.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Padrões Identificados</Text>
          <View style={styles.card}>
            {data.padroes.map((padrao, index) => (
              <Text key={index} style={styles.text}>• {padrao}</Text>
            ))}
          </View>
        </>
      )}
      
      {/* Emoções Frequentes */}
      {data.emocoes.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Emoções Frequentes</Text>
          <View style={styles.card}>
            {data.emocoes.map((emocao, index) => (
              <Text key={index} style={styles.text}>• {emocao}</Text>
            ))}
          </View>
        </>
      )}
      
      {/* Entradas do Diário */}
      <Text style={styles.sectionTitle}>Episódios Registrados</Text>
      {data.entradas.map((entrada, index) => (
        <View key={index} style={entrada.impacto >= 3 ? styles.alertCard : styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Data:</Text>
            <Text style={styles.value}>{entrada.data}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Título:</Text>
            <Text style={styles.value}>{entrada.titulo}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Contexto:</Text>
            <Text style={styles.value}>{entrada.contexto}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Impacto:</Text>
            <Text style={styles.value}>{entrada.impacto}/4 {entrada.impacto >= 3 ? '⚠️ Alto' : entrada.impacto >= 2 ? '⚡ Médio' : '✓ Baixo'}</Text>
          </View>
          {entrada.tags.length > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Tags:</Text>
              <Text style={styles.value}>{entrada.tags.join(', ')}</Text>
            </View>
          )}
          <Text style={[styles.text, { marginTop: 5 }]}>{entrada.resumo}</Text>
        </View>
      ))}
      
      <Disclaimer />
      <Footer pageNumber={1} />
    </Page>
  </Document>
)

// ============================================
// DOCUMENTO: RELATÓRIO COMPLETO
// ============================================

export const RelatorioCompletoPDF = ({ data }: { data: RelatorioCompletoData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Header />
      
      <Text style={styles.title}>Relatório Completo de Acompanhamento</Text>
      <Text style={styles.text}>Gerado em: {data.dataGeracao}</Text>
      
      {/* Informações do Usuário */}
      <Text style={styles.sectionTitle}>Informações</Text>
      <View style={styles.card}>
        {data.usuario.nome && (
          <View style={styles.row}>
            <Text style={styles.label}>Nome:</Text>
            <Text style={styles.value}>{data.usuario.nome}</Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.label}>Identificador:</Text>
          <Text style={styles.value}>{data.usuario.email || 'Anônimo'}</Text>
        </View>
      </View>
      
      {/* Resumo do Teste */}
      {data.teste && (
        <>
          <Text style={styles.sectionTitle}>Resumo do Teste de Clareza</Text>
          <View style={data.teste.zona === 'VERMELHA' ? styles.alertCard : styles.card}>
            <Text style={styles.boldText}>Resultado: {getZonaLabel(data.teste.zona)}</Text>
            <Text style={styles.text}>Névoa: {data.teste.scores.nevoa}/16 | Medo: {data.teste.scores.medo}/16 | Limites: {data.teste.scores.limites}/16</Text>
            <Text style={styles.text}>Total: {data.teste.scores.total}/48</Text>
          </View>
        </>
      )}
      
      {/* Análise da IA */}
      {data.analiseIA && (
        <>
          <Text style={styles.sectionTitle}>Análise de Padrões (IA)</Text>
          
          {data.analiseIA.alertas.length > 0 && (
            <View style={styles.alertCard}>
              <Text style={styles.boldText}>⚠️ Alertas Identificados:</Text>
              {data.analiseIA.alertas.map((alerta, index) => (
                <Text key={index} style={styles.text}>• {alerta}</Text>
              ))}
            </View>
          )}
          
          {data.analiseIA.padroes.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.boldText}>📊 Padrões Detectados:</Text>
              {data.analiseIA.padroes.map((padrao, index) => (
                <Text key={index} style={styles.text}>• {padrao}</Text>
              ))}
            </View>
          )}
          
          {data.analiseIA.sugestoes.length > 0 && (
            <View style={styles.successCard}>
              <Text style={styles.boldText}>💡 Sugestões:</Text>
              {data.analiseIA.sugestoes.map((sugestao, index) => (
                <Text key={index} style={styles.text}>• {sugestao}</Text>
              ))}
            </View>
          )}
        </>
      )}
      
      {/* Resumo do Diário */}
      {data.diario && (
        <>
          <Text style={styles.sectionTitle}>Resumo do Diário</Text>
          <View style={styles.card}>
            <Text style={styles.text}>Período: {data.diario.periodo}</Text>
            <Text style={styles.text}>Total de entradas: {data.diario.totalEntradas}</Text>
            {data.diario.padroes.length > 0 && (
              <Text style={styles.text}>Padrões: {data.diario.padroes.join(', ')}</Text>
            )}
          </View>
        </>
      )}
      
      <Disclaimer />
      <Footer pageNumber={1} />
    </Page>
  </Document>
)

// ============================================
// DOCUMENTO: RELATÓRIO PROFISSIONAL
// ============================================

const HeaderProfissional = ({ tipo }: { tipo: 'terapeuta' | 'advogado' | 'outro' }) => (
  <View style={styles.header}>
    <Text style={styles.logo}>🔍 Radar Narcisista</Text>
    <Text style={styles.subtitle}>
      {tipo === 'terapeuta' 
        ? 'Relatório para Acompanhamento Terapêutico' 
        : tipo === 'advogado'
          ? 'Relatório para Orientação Jurídica'
          : 'Relatório Confidencial'}
    </Text>
  </View>
)

const DisclaimerProfissional = ({ tipo }: { tipo: 'terapeuta' | 'advogado' | 'outro' }) => (
  <View style={styles.disclaimer}>
    <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>⚠️ INFORMAÇÕES IMPORTANTES:</Text>
    <Text style={{ marginBottom: 3 }}>
      • Este relatório foi gerado automaticamente com base em auto-relatos do usuário.
    </Text>
    <Text style={{ marginBottom: 3 }}>
      • As informações NÃO foram verificadas independentemente e representam a perspectiva subjetiva do relator.
    </Text>
    <Text style={{ marginBottom: 3 }}>
      • Este documento NÃO constitui diagnóstico clínico, laudo pericial ou prova jurídica.
    </Text>
    {tipo === 'advogado' && (
      <Text style={{ marginBottom: 3 }}>
        • Para uso em processos judiciais, recomenda-se avaliação pericial independente.
      </Text>
    )}
    {tipo === 'terapeuta' && (
      <Text style={{ marginBottom: 3 }}>
        • Recomenda-se avaliação clínica própria para complementar estas informações.
      </Text>
    )}
    <Text>
      • Integridade do documento verificável pelo hash SHA-256 no rodapé.
    </Text>
  </View>
)

const getTendenciaLabel = (tendencia: 'aumentando' | 'estavel' | 'diminuindo') => {
  switch (tendencia) {
    case 'aumentando': return '📈 Aumentando'
    case 'diminuindo': return '📉 Diminuindo'
    default: return '➡️ Estável'
  }
}

export const RelatorioProfissionalPDF = ({ data }: { data: RelatorioProfissionalData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <HeaderProfissional tipo={data.destinatario.tipo} />
      
      <Text style={styles.title}>
        Relatório de Acompanhamento - {data.destinatario.tipo === 'terapeuta' ? 'Terapia' : data.destinatario.tipo === 'advogado' ? 'Jurídico' : 'Geral'}
      </Text>
      
      {/* Informações do Documento */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Data de Geração:</Text>
          <Text style={styles.value}>{data.dataGeracao}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Período Analisado:</Text>
          <Text style={styles.value}>{data.periodoAnalise.inicio} a {data.periodoAnalise.fim}</Text>
        </View>
        {data.destinatario.nome && (
          <View style={styles.row}>
            <Text style={styles.label}>Destinatário:</Text>
            <Text style={styles.value}>{data.destinatario.nome}</Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.label}>Identificador:</Text>
          <Text style={styles.value}>{data.paciente.identificador}</Text>
        </View>
      </View>

      {/* Resumo Executivo */}
      <Text style={styles.sectionTitle}>Resumo Executivo</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Total de Episódios:</Text>
          <Text style={styles.value}>{data.resumoExecutivo.totalEpisodios}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Episódios Alto Impacto:</Text>
          <Text style={styles.value}>{data.resumoExecutivo.episodiosAltoImpacto}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Impacto Médio:</Text>
          <Text style={styles.value}>{data.resumoExecutivo.impactoMedio.toFixed(1)}/3</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Dias com Registro:</Text>
          <Text style={styles.value}>{data.resumoExecutivo.diasComRegistro}</Text>
        </View>
      </View>

      {/* Padrões Identificados */}
      {data.padroesIdentificados.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Padrões Comportamentais Identificados</Text>
          {data.padroesIdentificados.map((categoria, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.boldText}>{categoria.categoria}</Text>
              <Text style={styles.text}>Frequência: {categoria.frequencia} ocorrências | {getTendenciaLabel(categoria.tendencia)}</Text>
              {categoria.padroes.map((padrao, idx) => (
                <Text key={idx} style={styles.text}>• {padrao}</Text>
              ))}
            </View>
          ))}
        </>
      )}

      <DisclaimerProfissional tipo={data.destinatario.tipo} />
      <Footer pageNumber={1} />
    </Page>

    {/* Página 2: Cronologia de Episódios */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>Cronologia de Episódios</Text>
      <Text style={styles.text}>
        Os episódios abaixo foram registrados pelo usuário e apresentados em ordem cronológica.
        A linguagem foi mantida neutra para facilitar a análise profissional.
      </Text>

      {data.cronologiaEpisodios.map((episodio, index) => (
        <View key={index} style={episodio.impacto >= 3 ? styles.alertCard : styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Data:</Text>
            <Text style={styles.value}>{episodio.data}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Título:</Text>
            <Text style={styles.value}>{episodio.titulo}</Text>
          </View>
          {episodio.contexto && (
            <View style={styles.row}>
              <Text style={styles.label}>Contexto:</Text>
              <Text style={styles.value}>{episodio.contexto}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Impacto:</Text>
            <Text style={styles.value}>
              {episodio.impacto}/3 ({episodio.impacto >= 3 ? 'Alto' : episodio.impacto >= 2 ? 'Médio' : 'Baixo'})
            </Text>
          </View>
          {episodio.tags.length > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Padrões:</Text>
              <Text style={styles.value}>{episodio.tags.join(', ')}</Text>
            </View>
          )}
          <Text style={[styles.text, { marginTop: 5 }]}>{episodio.descricaoNeutra}</Text>
        </View>
      ))}

      {data.observacoesAdicionais && (
        <>
          <Text style={styles.sectionTitle}>Observações Adicionais</Text>
          <View style={styles.card}>
            <Text style={styles.text}>{data.observacoesAdicionais}</Text>
          </View>
        </>
      )}

      <Footer pageNumber={2} />
    </Page>
  </Document>
)

// ============================================
// FUNÇÕES DE GERAÇÃO
// ============================================

/**
 * Resultado da geração de PDF com hash
 */
export interface PDFGenerationResult {
  blob: Blob
  hash: string
  documentId: string
  generatedAt: string
  filename: string
}

/**
 * Gera um ID único para o documento
 */
function generateDocumentId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `RN-${timestamp}-${random}`.toUpperCase()
}

/**
 * Gera PDF do Teste de Clareza e retorna como Blob com hash
 */
export async function gerarPDFTeste(data: RelatorioTesteData): Promise<PDFGenerationResult> {
  const doc = <RelatorioTestePDF data={data} />
  const blob = await pdf(doc).toBlob()
  const hash = await generateBlobHash(blob)
  const documentId = generateDocumentId()
  const generatedAt = new Date().toISOString()
  const dataFormatada = generatedAt.split('T')[0]
  
  return {
    blob,
    hash,
    documentId,
    generatedAt,
    filename: `radar-narcisista-teste-${dataFormatada}.pdf`
  }
}

/**
 * Gera PDF do Diário e retorna como Blob com hash
 */
export async function gerarPDFDiario(data: RelatorioDiarioData): Promise<PDFGenerationResult> {
  const doc = <RelatorioDiarioPDF data={data} />
  const blob = await pdf(doc).toBlob()
  const hash = await generateBlobHash(blob)
  const documentId = generateDocumentId()
  const generatedAt = new Date().toISOString()
  const dataFormatada = generatedAt.split('T')[0]
  
  return {
    blob,
    hash,
    documentId,
    generatedAt,
    filename: `radar-narcisista-diario-${dataFormatada}.pdf`
  }
}

/**
 * Gera PDF Completo e retorna como Blob com hash
 */
export async function gerarPDFCompleto(data: RelatorioCompletoData): Promise<PDFGenerationResult> {
  const doc = <RelatorioCompletoPDF data={data} />
  const blob = await pdf(doc).toBlob()
  const hash = await generateBlobHash(blob)
  const documentId = generateDocumentId()
  const generatedAt = new Date().toISOString()
  const dataFormatada = generatedAt.split('T')[0]
  
  return {
    blob,
    hash,
    documentId,
    generatedAt,
    filename: `radar-narcisista-relatorio-completo-${dataFormatada}.pdf`
  }
}

/**
 * Baixa o PDF automaticamente
 */
export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Gera e baixa PDF do Teste (retorna metadados para salvar no banco)
 */
export async function gerarEBaixarPDFTeste(data: RelatorioTesteData): Promise<PDFGenerationResult> {
  const result = await gerarPDFTeste(data)
  downloadPDF(result.blob, result.filename)
  
  // Log para debug/auditoria
  console.log(`[PDF] Teste gerado - ID: ${result.documentId} | Hash: ${result.hash.substring(0, 16)}...`)
  
  return result
}

/**
 * Gera, baixa E salva PDF do Teste no Supabase
 */
export async function gerarBaixarESalvarPDFTeste(
  data: RelatorioTesteData, 
  userId: string
): Promise<PDFGenerationResult & { hashSalvo: boolean }> {
  const result = await gerarPDFTeste(data)
  downloadPDF(result.blob, result.filename)
  
  // Salvar hash no banco
  const hashSalvo = await saveDocumentHash(result, userId, 'CLARITY_TEST', {
    zona: data.zona,
    totalScore: data.scores.total
  })
  
  console.log(`[PDF] Teste gerado - ID: ${result.documentId} | Hash: ${result.hash.substring(0, 16)}... | Salvo: ${hashSalvo}`)
  
  return { ...result, hashSalvo }
}

/**
 * Gera e baixa PDF do Diário (retorna metadados para salvar no banco)
 */
export async function gerarEBaixarPDFDiario(data: RelatorioDiarioData): Promise<PDFGenerationResult> {
  const result = await gerarPDFDiario(data)
  downloadPDF(result.blob, result.filename)
  
  console.log(`[PDF] Diário gerado - ID: ${result.documentId} | Hash: ${result.hash.substring(0, 16)}...`)
  
  return result
}

/**
 * Gera, baixa E salva PDF do Diário no Supabase
 */
export async function gerarBaixarESalvarPDFDiario(
  data: RelatorioDiarioData, 
  userId: string
): Promise<PDFGenerationResult & { hashSalvo: boolean }> {
  const result = await gerarPDFDiario(data)
  downloadPDF(result.blob, result.filename)
  
  // Salvar hash no banco
  const hashSalvo = await saveDocumentHash(result, userId, 'JOURNAL', {
    periodo: data.periodo,
    totalEntradas: data.totalEntradas
  })
  
  console.log(`[PDF] Diário gerado - ID: ${result.documentId} | Hash: ${result.hash.substring(0, 16)}... | Salvo: ${hashSalvo}`)
  
  return { ...result, hashSalvo }
}

/**
 * Gera e baixa PDF Completo (retorna metadados para salvar no banco)
 */
export async function gerarEBaixarPDFCompleto(data: RelatorioCompletoData): Promise<PDFGenerationResult> {
  const result = await gerarPDFCompleto(data)
  downloadPDF(result.blob, result.filename)
  
  console.log(`[PDF] Relatório completo gerado - ID: ${result.documentId} | Hash: ${result.hash.substring(0, 16)}...`)
  
  return result
}

/**
 * Gera, baixa E salva PDF Completo no Supabase
 */
export async function gerarBaixarESalvarPDFCompleto(
  data: RelatorioCompletoData, 
  userId: string
): Promise<PDFGenerationResult & { hashSalvo: boolean }> {
  const result = await gerarPDFCompleto(data)
  downloadPDF(result.blob, result.filename)
  
  // Salvar hash no banco
  const hashSalvo = await saveDocumentHash(result, userId, 'COMPLETE_REPORT', {
    dataGeracao: data.dataGeracao,
    temTeste: !!data.teste,
    temDiario: !!data.diario
  })
  
  console.log(`[PDF] Relatório completo gerado - ID: ${result.documentId} | Hash: ${result.hash.substring(0, 16)}... | Salvo: ${hashSalvo}`)
  
  return { ...result, hashSalvo }
}

/**
 * Gera PDF Profissional (para terapeuta/advogado) e retorna como Blob com hash
 */
export async function gerarPDFProfissional(data: RelatorioProfissionalData): Promise<PDFGenerationResult> {
  const doc = <RelatorioProfissionalPDF data={data} />
  const blob = await pdf(doc).toBlob()
  const hash = await generateBlobHash(blob)
  const documentId = generateDocumentId()
  const generatedAt = new Date().toISOString()
  const dataFormatada = generatedAt.split('T')[0]
  const tipoSufixo = data.destinatario.tipo === 'terapeuta' ? 'terapia' : data.destinatario.tipo === 'advogado' ? 'juridico' : 'profissional'
  
  return {
    blob,
    hash,
    documentId,
    generatedAt,
    filename: `radar-narcisista-relatorio-${tipoSufixo}-${dataFormatada}.pdf`
  }
}

/**
 * Gera e baixa PDF Profissional (retorna metadados para salvar no banco)
 */
export async function gerarEBaixarPDFProfissional(data: RelatorioProfissionalData): Promise<PDFGenerationResult> {
  const result = await gerarPDFProfissional(data)
  downloadPDF(result.blob, result.filename)
  
  console.log(`[PDF] Relatório profissional (${data.destinatario.tipo}) gerado - ID: ${result.documentId} | Hash: ${result.hash.substring(0, 16)}...`)
  
  return result
}

/**
 * Gera, baixa E salva PDF Profissional no Supabase
 */
export async function gerarBaixarESalvarPDFProfissional(
  data: RelatorioProfissionalData, 
  userId: string
): Promise<PDFGenerationResult & { hashSalvo: boolean }> {
  const result = await gerarPDFProfissional(data)
  downloadPDF(result.blob, result.filename)
  
  // Salvar hash no banco
  const hashSalvo = await saveDocumentHash(result, userId, 'PROFESSIONAL_SUMMARY', {
    destinatario: data.destinatario.tipo,
    dataGeracao: data.dataGeracao,
    totalEpisodios: data.resumoExecutivo.totalEpisodios
  })
  
  console.log(`[PDF] Relatório profissional (${data.destinatario.tipo}) gerado - ID: ${result.documentId} | Hash: ${result.hash.substring(0, 16)}... | Salvo: ${hashSalvo}`)
  
  return { ...result, hashSalvo }
}

// ============================================
// SALVAR HASH NO BANCO (para uso com Supabase)
// ============================================

/**
 * Dados para salvar o registro do documento no banco
 */
export interface DocumentRecord {
  id: string
  user_id: string
  type: 'CLARITY_TEST' | 'JOURNAL' | 'COMPLETE_REPORT' | 'PROFESSIONAL_SUMMARY'
  sha256_hash: string
  filename: string
  generated_at: string
  metadata?: Record<string, any>
}

/**
 * Cria o registro do documento para salvar no Supabase
 */
export function createDocumentRecord(
  result: PDFGenerationResult,
  userId: string,
  type: DocumentRecord['type'],
  metadata?: Record<string, any>
): DocumentRecord {
  return {
    id: result.documentId,
    user_id: userId,
    type,
    sha256_hash: result.hash,
    filename: result.filename,
    generated_at: result.generatedAt,
    metadata
  }
}

// ============================================
// SALVAR HASH NO SUPABASE
// ============================================

/**
 * Salva o hash do documento no Supabase
 * Retorna true se salvou com sucesso, false se falhou
 */
export async function saveDocumentHash(
  result: PDFGenerationResult,
  userId: string,
  type: DocumentRecord['type'],
  metadata?: Record<string, any>
): Promise<boolean> {
  try {
    const record = createDocumentRecord(result, userId, type, metadata)
    
    const { error } = await supabase
      .from('document_hashes')
      .insert({
        id: record.id,
        user_id: record.user_id,
        type: record.type,
        sha256_hash: record.sha256_hash,
        filename: record.filename,
        generated_at: record.generated_at,
        metadata: record.metadata
      })

    if (error) {
      console.error('[PDF] Erro ao salvar hash no banco:', error)
      return false
    }

    console.log(`[PDF] Hash salvo no banco - ID: ${record.id}`)
    return true
  } catch (error) {
    console.error('[PDF] Erro ao salvar hash:', error)
    return false
  }
}

/**
 * Verifica se um documento existe e retorna seus dados
 */
export async function getDocumentHash(documentId: string): Promise<DocumentRecord | null> {
  try {
    const { data, error } = await supabase
      .from('document_hashes')
      .select('*')
      .eq('id', documentId)
      .single()

    if (error || !data) {
      return null
    }

    return {
      id: data.id,
      user_id: data.user_id,
      type: data.type,
      sha256_hash: data.sha256_hash,
      filename: data.filename,
      generated_at: data.generated_at,
      metadata: data.metadata
    }
  } catch (error) {
    console.error('[PDF] Erro ao buscar hash:', error)
    return null
  }
}

/**
 * Lista todos os documentos de um usuário
 */
export async function listUserDocuments(userId: string): Promise<DocumentRecord[]> {
  try {
    const { data, error } = await supabase
      .from('document_hashes')
      .select('*')
      .eq('user_id', userId)
      .order('generated_at', { ascending: false })

    if (error || !data) {
      return []
    }

    return data.map(d => ({
      id: d.id,
      user_id: d.user_id,
      type: d.type,
      sha256_hash: d.sha256_hash,
      filename: d.filename,
      generated_at: d.generated_at,
      metadata: d.metadata
    }))
  } catch (error) {
    console.error('[PDF] Erro ao listar documentos:', error)
    return []
  }
}
