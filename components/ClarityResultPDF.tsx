'use client'

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  FileDown, 
  Printer, 
  Copy, 
  Loader2,
  CheckCircle2,
  Shield,
  Hash,
  Calendar,
  Clock,
  Monitor,
  User,
  QrCode
} from 'lucide-react'
import QRCode from 'qrcode'
import type { UnifiedResult } from '@/lib/clarity-unified-config'
import { THREE_VOICES_CONTENT, categoryToTopicId } from '@/lib/clarity-three-voices'

// =============================================================================
// COMPONENTE DE EXPORTAÇÃO PDF/IMPRESSÃO DO RESULTADO
// Inclui cadeia de custódia completa
// =============================================================================

interface ClarityResultPDFProps {
  result: UnifiedResult
  testDate: string
  isDarkMode: boolean
}

interface TermsAcceptance {
  accepted_at: string
  event_hash: string
  ip_address: string
  user_agent: string
  timezone: string
  locale: string
  screen_resolution: string
  platform: string
  terms_version: {
    title: string
    version_number: string
    content_md: string
  }
}

interface UserProfile {
  email: string
  full_name?: string
}

export interface ClarityResultPDFHandle {
  downloadPDF: () => Promise<void>
}

const ClarityResultPDF = forwardRef<ClarityResultPDFHandle, ClarityResultPDFProps>(({ result, testDate, isDarkMode }, ref) => {
  const [isLoading, setIsLoading] = useState(false)
  const [termsAcceptance, setTermsAcceptance] = useState<TermsAcceptance | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [copied, setCopied] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const printRef = useRef<HTMLDivElement>(null)

  const supabase = createClient()

  // Expor função de download para componentes pais
  useImperativeHandle(ref, () => ({
    downloadPDF: handleDownloadPDF
  }))

  useEffect(() => {
    loadTermsAndUser()
  }, [])

  // Gerar QR Code quando tiver o hash
  useEffect(() => {
    if (termsAcceptance?.event_hash) {
      generateQRCode(termsAcceptance.event_hash)
    }
  }, [termsAcceptance])

  const generateQRCode = async (hash: string) => {
    try {
      const verificationUrl = `${window.location.origin}/verificar/${hash}`
      const dataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 150,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
      setQrCodeDataUrl(dataUrl)
    } catch (err) {
      console.error('Erro ao gerar QR Code:', err)
    }
  }

  const loadTermsAndUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserProfile({
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || ''
      })

      // Buscar aceite de termos mais recente
      const { data, error } = await supabase
        .from('terms_acceptances')
        .select(`
          accepted_at,
          event_hash,
          ip_address,
          user_agent,
          timezone,
          locale,
          screen_resolution,
          platform,
          terms_version:terms_version_id (
            title,
            version_number,
            content_md
          )
        `)
        .eq('user_id', user.id)
        .order('accepted_at', { ascending: false })
        .limit(1)
        .single()

      if (!error && data) {
        setTermsAcceptance(data as any)
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
    }
  }

  // Gerar conteúdo HTML completo do PDF com 3 vozes
  const generateFullHTMLContent = (qrDataUrl: string) => {
    const now = new Date()
    const zoneConfig = getZoneLabel(result.globalZone)
    const verificationUrl = termsAcceptance 
      ? `${typeof window !== 'undefined' ? window.location.origin : 'https://radarnarcisista.com.br'}/verificar/${termsAcceptance.event_hash}`
      : ''

    // Importar conteúdo das 3 vozes
    const threeVoicesContent = getThreeVoicesContent()

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Mapa de Clareza - Radar Narcisista BR</title>
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #1e293b;
      background: #fff;
      padding: 20px;
    }
    
    .page-break {
      page-break-before: always;
    }
    
    .no-break {
      page-break-inside: avoid;
    }
    
    /* Header */
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 3px solid #7c3aed;
      margin-bottom: 30px;
    }
    
    .header h1 {
      font-size: 24pt;
      color: #7c3aed;
      margin-bottom: 5px;
    }
    
    .header .subtitle {
      font-size: 12pt;
      color: #64748b;
    }
    
    .header .date {
      font-size: 10pt;
      color: #94a3b8;
      margin-top: 10px;
    }
    
    /* Sections */
    .section {
      margin-bottom: 30px;
    }
    
    .section-title {
      font-size: 16pt;
      color: #1e293b;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 8px;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .section-number {
      background: #7c3aed;
      color: white;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 14pt;
      font-weight: bold;
    }
    
    /* Zone Badge */
    .zone-badge {
      display: inline-block;
      padding: 10px 25px;
      border-radius: 25px;
      font-size: 14pt;
      font-weight: bold;
      margin: 15px 0;
    }
    
    .zone-atencao { background: #fef3c7; color: #92400e; border: 2px solid #f59e0b; }
    .zone-alerta { background: #ffedd5; color: #9a3412; border: 2px solid #f97316; }
    .zone-vermelha { background: #fee2e2; color: #991b1b; border: 2px solid #ef4444; }
    
    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin: 20px 0;
    }
    
    .stat-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 15px;
      text-align: center;
    }
    
    .stat-value {
      font-size: 24pt;
      font-weight: bold;
      color: #7c3aed;
    }
    
    .stat-label {
      font-size: 9pt;
      color: #64748b;
      text-transform: uppercase;
    }
    
    /* Voice Boxes */
    .voices-container {
      margin: 20px 0;
    }
    
    .voice-box {
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 15px;
      page-break-inside: avoid;
    }
    
    .voice-colinho {
      background: #f5f3ff;
      border-left: 4px solid #8b5cf6;
    }
    
    .voice-profissional {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
    }
    
    .voice-defesa {
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
    }
    
    .voice-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
      font-weight: bold;
      font-size: 11pt;
    }
    
    .voice-colinho .voice-header { color: #7c3aed; }
    .voice-profissional .voice-header { color: #2563eb; }
    .voice-defesa .voice-header { color: #d97706; }
    
    .voice-text {
      font-size: 10pt;
      line-height: 1.6;
      color: #334155;
      white-space: pre-line;
    }
    
    .micro-action {
      background: #ecfdf5;
      border: 1px solid #10b981;
      border-radius: 8px;
      padding: 12px 15px;
      margin-top: 10px;
    }
    
    .micro-action-title {
      font-weight: bold;
      color: #059669;
      font-size: 10pt;
      margin-bottom: 5px;
    }
    
    .micro-action-text {
      font-size: 9pt;
      color: #047857;
    }
    
    /* Axis/Category Cards */
    .axis-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 25px;
      page-break-inside: avoid;
    }
    
    .axis-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    
    .axis-title {
      font-size: 14pt;
      font-weight: bold;
      color: #1e293b;
    }
    
    .axis-score {
      font-size: 18pt;
      font-weight: bold;
    }
    
    .progress-bar {
      height: 10px;
      background: #e2e8f0;
      border-radius: 5px;
      overflow: hidden;
      margin-bottom: 15px;
    }
    
    .progress-fill {
      height: 100%;
      border-radius: 5px;
    }
    
    .progress-nevoa { background: linear-gradient(90deg, #8b5cf6, #a78bfa); }
    .progress-medo { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
    .progress-limites { background: linear-gradient(90deg, #f43f5e, #fb7185); }
    
    /* Category Grid */
    .category-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin: 20px 0;
    }
    
    .category-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 15px;
    }
    
    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .category-name {
      font-weight: bold;
      font-size: 10pt;
    }
    
    .category-score {
      font-weight: bold;
      font-size: 12pt;
    }
    
    .score-low { color: #22c55e; }
    .score-medium { color: #f59e0b; }
    .score-high { color: #ef4444; }
    
    /* Custody Chain */
    .custody-section {
      background: #f0fdf4;
      border: 2px solid #22c55e;
      border-radius: 12px;
      padding: 20px;
      margin: 30px 0;
    }
    
    .custody-title {
      font-size: 14pt;
      font-weight: bold;
      color: #166534;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .custody-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }
    
    .custody-item {
      background: white;
      border-radius: 8px;
      padding: 12px;
    }
    
    .custody-label {
      font-size: 8pt;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    
    .custody-value {
      font-size: 10pt;
      color: #1e293b;
      font-weight: 500;
    }
    
    .hash-box {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 12px;
      margin-top: 15px;
      font-family: 'Courier New', monospace;
      font-size: 8pt;
      word-break: break-all;
      color: #92400e;
    }
    
    /* QR Section */
    .qr-section {
      text-align: center;
      padding: 30px;
      border: 2px dashed #cbd5e1;
      border-radius: 15px;
      margin: 30px 0;
      page-break-inside: avoid;
    }
    
    .qr-title {
      font-size: 12pt;
      font-weight: bold;
      color: #1e293b;
      margin-bottom: 15px;
    }
    
    .qr-image {
      width: 150px;
      height: 150px;
      margin: 0 auto;
    }
    
    .qr-url {
      font-size: 8pt;
      color: #64748b;
      margin-top: 10px;
      word-break: break-all;
    }
    
    /* Disclaimer */
    .disclaimer {
      background: #fef3c7;
      border: 2px solid #f59e0b;
      border-radius: 12px;
      padding: 20px;
      margin: 30px 0;
    }
    
    .disclaimer-title {
      font-weight: bold;
      color: #92400e;
      margin-bottom: 10px;
      font-size: 12pt;
    }
    
    .disclaimer-text {
      font-size: 9pt;
      color: #78350f;
      line-height: 1.6;
    }
    
    .disclaimer-text ul {
      margin-left: 20px;
      margin-top: 10px;
    }
    
    /* Emergency */
    .emergency {
      background: #fee2e2;
      border: 2px solid #ef4444;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin: 30px 0;
    }
    
    .emergency-title {
      font-weight: bold;
      color: #991b1b;
      margin-bottom: 10px;
      font-size: 12pt;
    }
    
    .emergency-numbers {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin-top: 10px;
    }
    
    .emergency-item {
      text-align: center;
    }
    
    .emergency-number {
      font-size: 18pt;
      font-weight: bold;
      color: #dc2626;
    }
    
    .emergency-label {
      font-size: 8pt;
      color: #991b1b;
    }
    
    /* Footer */
    .footer {
      text-align: center;
      padding: 20px;
      border-top: 2px solid #e2e8f0;
      margin-top: 30px;
      color: #64748b;
      font-size: 9pt;
    }
    
    /* Terms Content */
    .terms-content {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
      font-size: 9pt;
      line-height: 1.6;
      max-height: none;
    }
  </style>
</head>
<body>

  <!-- CAPA / HEADER -->
  <div class="header">
    <h1>🎯 Mapa de Clareza</h1>
    <div class="subtitle">Radar Narcisista BR - Teste de Clareza em Relações</div>
    <div class="date">
      📅 Teste realizado em: ${testDate}<br>
      📄 Documento gerado em: ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}
    </div>
  </div>

  <!-- SEÇÃO 1: RESULTADO GERAL -->
  <div class="section no-break">
    <div class="section-title">
      <span class="section-number">1</span>
      Sua Situação Geral
    </div>
    
    <div style="text-align: center;">
      <div class="zone-badge zone-${result.globalZone}">
        ${zoneConfig.label.toUpperCase()}
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${Math.round(result.overallPercentage * 100)}%</div>
        <div class="stat-label">Pontuação Geral</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${result.axisScores.length}</div>
        <div class="stat-label">Eixos Avaliados</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${result.categoryScores.length}</div>
        <div class="stat-label">Categorias</div>
      </div>
    </div>
    
    ${result.hasPhysicalRisk ? `
    <div style="background: #fee2e2; border: 2px solid #ef4444; border-radius: 10px; padding: 15px; margin: 15px 0;">
      <strong style="color: #991b1b;">⚠️ ALERTA DE RISCO FÍSICO DETECTADO</strong>
      <p style="color: #7f1d1d; font-size: 10pt; margin-top: 5px;">
        Sua segurança é prioridade. Considere buscar ajuda especializada imediatamente.
      </p>
    </div>
    ` : ''}
    
    <!-- 3 Vozes: Situação Geral -->
    <div class="voices-container">
      ${threeVoicesContent.geral}
    </div>
  </div>

  <div class="page-break"></div>

  <!-- SEÇÃO 2: EIXOS PRINCIPAIS -->
  <div class="section">
    <div class="section-title">
      <span class="section-number">2</span>
      Como Isso Aparece no Seu Dia a Dia
    </div>
    
    ${result.axisScores.map(axis => {
      const axisLabel = axis.axis === 'nevoa' ? '🧠 Névoa Mental' : 
                        axis.axis === 'medo' ? '😰 Medo e Tensão' : '🛡️ Respeito aos Limites'
      const pct = Math.round(axis.percentage * 100)
      const topicId = axis.axis === 'nevoa' ? 'nevoa_mental' : 
                      axis.axis === 'medo' ? 'medo_tensao' : 'limites'
      
      return `
      <div class="axis-card">
        <div class="axis-header">
          <div class="axis-title">${axisLabel}</div>
          <div class="axis-score ${pct >= 66 ? 'score-high' : pct >= 33 ? 'score-medium' : 'score-low'}">${pct}%</div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill progress-${axis.axis}" style="width: ${pct}%"></div>
        </div>
        <div style="font-size: 9pt; color: #64748b; margin-bottom: 15px;">
          Nível: <strong>${axis.level.toUpperCase()}</strong>
        </div>
        
        <!-- 3 Vozes deste eixo -->
        ${threeVoicesContent[topicId] || ''}
      </div>
      `
    }).join('')}
  </div>

  <div class="page-break"></div>

  <!-- SEÇÃO 3: CATEGORIAS -->
  <div class="section">
    <div class="section-title">
      <span class="section-number">3</span>
      Onde Isso Pega Mais Forte
    </div>
    
    <div class="category-grid">
      ${result.categoryScores.map(cat => {
        const pct = Math.round(cat.percentage * 100)
        return `
        <div class="category-card">
          <div class="category-header">
            <span class="category-name">${cat.label}</span>
            <span class="category-score ${pct >= 66 ? 'score-high' : pct >= 33 ? 'score-medium' : 'score-low'}">${pct}%</span>
          </div>
          <div class="progress-bar" style="height: 6px;">
            <div class="progress-fill" style="width: ${pct}%; background: ${pct >= 66 ? '#ef4444' : pct >= 33 ? '#f59e0b' : '#22c55e'};"></div>
          </div>
        </div>
        `
      }).join('')}
    </div>
    
    <!-- Detalhes de cada categoria com 3 vozes -->
    ${result.categoryScores.filter(cat => cat.percentage >= 0.3).map(cat => {
      const topicId = categoryToTopicId(cat.category)
      return `
      <div class="axis-card" style="margin-top: 20px;">
        <div class="axis-header">
          <div class="axis-title">${cat.label}</div>
          <div class="axis-score ${cat.percentage >= 0.66 ? 'score-high' : cat.percentage >= 0.33 ? 'score-medium' : 'score-low'}">${Math.round(cat.percentage * 100)}%</div>
        </div>
        ${threeVoicesContent[topicId] || ''}
      </div>
      `
    }).join('')}
  </div>

  <div class="page-break"></div>

  <!-- SEÇÃO 4: CADEIA DE CUSTÓDIA -->
  <div class="section">
    <div class="section-title">
      <span class="section-number">4</span>
      Cadeia de Custódia
    </div>
    
    <div class="custody-section">
      <div class="custody-title">🔐 Dados de Verificação do Documento</div>
      
      <div class="custody-grid">
        ${userProfile ? `
        <div class="custody-item">
          <div class="custody-label">Usuário</div>
          <div class="custody-value">${userProfile.full_name || 'Não informado'}</div>
        </div>
        <div class="custody-item">
          <div class="custody-label">Email</div>
          <div class="custody-value">${userProfile.email}</div>
        </div>
        ` : ''}
        
        ${termsAcceptance ? `
        <div class="custody-item">
          <div class="custody-label">Termo Aceito</div>
          <div class="custody-value">${termsAcceptance.terms_version.title}</div>
        </div>
        <div class="custody-item">
          <div class="custody-label">Data do Aceite</div>
          <div class="custody-value">${new Date(termsAcceptance.accepted_at).toLocaleDateString('pt-BR')} às ${new Date(termsAcceptance.accepted_at).toLocaleTimeString('pt-BR')}</div>
        </div>
        <div class="custody-item">
          <div class="custody-label">Dispositivo</div>
          <div class="custody-value">${parseDevice(termsAcceptance.user_agent)} (${termsAcceptance.platform})</div>
        </div>
        <div class="custody-item">
          <div class="custody-label">Resolução</div>
          <div class="custody-value">${termsAcceptance.screen_resolution}</div>
        </div>
        <div class="custody-item">
          <div class="custody-label">Fuso Horário</div>
          <div class="custody-value">${termsAcceptance.timezone}</div>
        </div>
        <div class="custody-item">
          <div class="custody-label">Idioma</div>
          <div class="custody-value">${termsAcceptance.locale}</div>
        </div>
        ` : ''}
      </div>
      
      ${termsAcceptance ? `
      <div class="hash-box">
        <strong>🔒 HASH SHA-256 (Prova de Integridade):</strong><br>
        ${termsAcceptance.event_hash}
      </div>
      ` : ''}
    </div>
    
    <!-- QR Code -->
    ${qrDataUrl ? `
    <div class="qr-section">
      <div class="qr-title">📱 Escaneie para Verificar Autenticidade</div>
      <img src="${qrDataUrl}" alt="QR Code de Verificação" class="qr-image" />
      <div class="qr-url">${verificationUrl}</div>
    </div>
    ` : ''}
  </div>

  <!-- SEÇÃO 5: TERMO DE RESPONSABILIDADE -->
  ${termsAcceptance?.terms_version?.content_md ? `
  <div class="page-break"></div>
  <div class="section">
    <div class="section-title">
      <span class="section-number">5</span>
      Termo de Responsabilidade Aceito
    </div>
    
    <div class="terms-content">
      ${termsAcceptance.terms_version.content_md
        .replace(/^# (.*)/gm, '<h2 style="font-size: 14pt; margin: 15px 0 10px;">$1</h2>')
        .replace(/^## (.*)/gm, '<h3 style="font-size: 12pt; margin: 12px 0 8px;">$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^- (.*)/gm, '<li>$1</li>')
        .replace(/\n\n/g, '</p><p style="margin: 10px 0;">')
      }
    </div>
  </div>
  ` : ''}

  <!-- DISCLAIMER -->
  <div class="disclaimer">
    <div class="disclaimer-title">⚠️ AVISOS LEGAIS IMPORTANTES</div>
    <div class="disclaimer-text">
      <ul>
        <li>Este documento <strong>NÃO</strong> constitui diagnóstico clínico, parecer psicológico ou prova judicial.</li>
        <li>O teste reflete apenas a perspectiva unilateral do usuário no momento da aplicação.</li>
        <li>Não substitui acompanhamento profissional de psicólogo, psiquiatra ou advogado.</li>
        <li>O hash SHA-256 garante a integridade deste documento para fins de auditoria.</li>
        <li>Este é um instrumento de autoconhecimento e organização de percepções.</li>
      </ul>
    </div>
  </div>

  <!-- CONTATOS DE EMERGÊNCIA -->
  <div class="emergency">
    <div class="emergency-title">📞 CONTATOS DE EMERGÊNCIA</div>
    <div class="emergency-numbers">
      <div class="emergency-item">
        <div class="emergency-number">190</div>
        <div class="emergency-label">Polícia Militar</div>
      </div>
      <div class="emergency-item">
        <div class="emergency-number">180</div>
        <div class="emergency-label">Central da Mulher</div>
      </div>
      <div class="emergency-item">
        <div class="emergency-number">188</div>
        <div class="emergency-label">CVV</div>
      </div>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <strong>Radar Narcisista BR</strong><br>
    https://radarnarcisista.com.br<br>
    Documento gerado automaticamente • ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}
  </div>

</body>
</html>
    `
  }

  // Função auxiliar para gerar HTML das 3 vozes
  const getThreeVoicesContent = (): Record<string, string> => {
    const topics = ['geral', 'nevoa_mental', 'medo_tensao', 'limites', 'invalidacao', 'gaslighting', 'controle', 'isolamento', 'abuso_emocional', 'risco_fisico']
    const content: Record<string, string> = {}
    
    for (const topicId of topics) {
      const topic = THREE_VOICES_CONTENT[topicId]
      if (!topic) continue
      
      content[topicId] = `
        <div class="voices-container">
          <div class="voice-box voice-colinho">
            <div class="voice-header">💜 Voz Colinho (Acolhedora)</div>
            <div class="voice-text">${topic.voices.colinho}</div>
          </div>
          
          <div class="voice-box voice-profissional">
            <div class="voice-header">🩺 Voz Profissional (Técnica)</div>
            <div class="voice-text">${topic.voices.profissional}</div>
          </div>
          
          <div class="voice-box voice-defesa">
            <div class="voice-header">⚖️ Voz Defesa (Documentação)</div>
            <div class="voice-text">${topic.voices.defesa}</div>
          </div>
          
          <div class="micro-action">
            <div class="micro-action-title">💡 Próximo Passo de 5 Minutos</div>
            <div class="micro-action-text">${topic.voices.micro_acao}</div>
          </div>
        </div>
      `
    }
    
    return content
  }

  // Gerar conteúdo texto simples para copiar
  const generateTextContent = () => {
    const now = new Date()
    const zoneConfig = getZoneLabel(result.globalZone)
    
    let content = `
═══════════════════════════════════════════════════════════════════════════════
                    RADAR NARCISISTA BR - MAPA DE CLAREZA
═══════════════════════════════════════════════════════════════════════════════

📅 Data do Teste: ${testDate}
📅 Data de Geração: ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}

───────────────────────────────────────────────────────────────────────────────
                              RESULTADO GERAL
───────────────────────────────────────────────────────────────────────────────

🎯 ZONA GLOBAL: ${zoneConfig.label.toUpperCase()}
📊 Pontuação: ${Math.round(result.overallPercentage * 100)}%
${result.hasPhysicalRisk ? '⚠️ ALERTA: Indicadores de risco físico detectados' : ''}

`

    // Adicionar 3 vozes para situação geral
    const geralContent = THREE_VOICES_CONTENT['geral']
    if (geralContent) {
      content += `
═══════════════════════════════════════════════════════════════════════════════
                          SUA SITUAÇÃO GERAL
═══════════════════════════════════════════════════════════════════════════════

💜 VOZ COLINHO (Acolhedora):
${geralContent.voices.colinho}

🩺 VOZ PROFISSIONAL (Técnica):
${geralContent.voices.profissional}

⚖️ VOZ DEFESA (Documentação):
${geralContent.voices.defesa}

💡 PRÓXIMO PASSO DE 5 MINUTOS:
${geralContent.voices.micro_acao}

`
    }

    // Eixos com 3 vozes
    content += `
═══════════════════════════════════════════════════════════════════════════════
                          ANÁLISE POR EIXO
═══════════════════════════════════════════════════════════════════════════════
`

    for (const axis of result.axisScores) {
      const axisLabel = axis.axis === 'nevoa' ? 'Névoa Mental' : 
                        axis.axis === 'medo' ? 'Medo/Tensão' : 'Desrespeito a Limites'
      const topicId = axis.axis === 'nevoa' ? 'nevoa_mental' : 
                      axis.axis === 'medo' ? 'medo_tensao' : 'limites'
      const topicContent = THREE_VOICES_CONTENT[topicId]
      
      content += `
───────────────────────────────────────────────────────────────────────────────
${axisLabel}: ${Math.round(axis.percentage * 100)}% (Nível: ${axis.level.toUpperCase()})
───────────────────────────────────────────────────────────────────────────────
`
      
      if (topicContent) {
        content += `
💜 VOZ COLINHO:
${topicContent.voices.colinho}

🩺 VOZ PROFISSIONAL:
${topicContent.voices.profissional}

⚖️ VOZ DEFESA:
${topicContent.voices.defesa}

💡 PRÓXIMO PASSO:
${topicContent.voices.micro_acao}

`
      }
    }

    // Categorias
    content += `
═══════════════════════════════════════════════════════════════════════════════
                          ANÁLISE POR CATEGORIA
═══════════════════════════════════════════════════════════════════════════════
`

    for (const cat of result.categoryScores) {
      content += `${cat.label}: ${Math.round(cat.percentage * 100)}%\n`
    }

    // Categorias com destaque (>30%) com 3 vozes
    const highlightedCats = result.categoryScores.filter(c => c.percentage >= 0.3)
    if (highlightedCats.length > 0) {
      content += `
───────────────────────────────────────────────────────────────────────────────
                    DETALHES DAS CATEGORIAS EM DESTAQUE
───────────────────────────────────────────────────────────────────────────────
`
      for (const cat of highlightedCats) {
        const topicId = categoryToTopicId(cat.category)
        const topicContent = THREE_VOICES_CONTENT[topicId]
        
        content += `
▶ ${cat.label.toUpperCase()} (${Math.round(cat.percentage * 100)}%)
`
        if (topicContent) {
          content += `
💜 VOZ COLINHO:
${topicContent.voices.colinho}

🩺 VOZ PROFISSIONAL:
${topicContent.voices.profissional}

⚖️ VOZ DEFESA:
${topicContent.voices.defesa}

💡 PRÓXIMO PASSO:
${topicContent.voices.micro_acao}

`
        }
      }
    }

    // Cadeia de custódia
    content += `
═══════════════════════════════════════════════════════════════════════════════
                          CADEIA DE CUSTÓDIA
═══════════════════════════════════════════════════════════════════════════════
`

    if (userProfile) {
      content += `
👤 USUÁRIO
   Nome: ${userProfile.full_name || 'Não informado'}
   Email: ${userProfile.email}
`
    }

    if (termsAcceptance) {
      const acceptedDate = new Date(termsAcceptance.accepted_at)
      content += `
📜 TERMO DE RESPONSABILIDADE ACEITO
   Título: ${termsAcceptance.terms_version.title}
   Data do Aceite: ${acceptedDate.toLocaleDateString('pt-BR')} às ${acceptedDate.toLocaleTimeString('pt-BR')}
   
🔐 DADOS TÉCNICOS
   Dispositivo: ${parseDevice(termsAcceptance.user_agent)} (${termsAcceptance.platform})
   Resolução: ${termsAcceptance.screen_resolution}
   Fuso Horário: ${termsAcceptance.timezone}
   
🔒 HASH SHA-256:
   ${termsAcceptance.event_hash}
`
    }

    content += `
═══════════════════════════════════════════════════════════════════════════════
                              AVISOS LEGAIS
═══════════════════════════════════════════════════════════════════════════════

⚠️ IMPORTANTE:
• Este documento NÃO constitui diagnóstico clínico, parecer psicológico ou prova judicial.
• O teste reflete apenas a perspectiva unilateral do usuário.
• Não substitui acompanhamento profissional de psicólogo, psiquiatra ou advogado.

📞 CONTATOS DE EMERGÊNCIA:
• 190 - Polícia Militar
• 180 - Central de Atendimento à Mulher
• 188 - CVV (Centro de Valorização da Vida)

═══════════════════════════════════════════════════════════════════════════════
Documento gerado pelo Radar Narcisista BR
https://radarnarcisista.com.br
═══════════════════════════════════════════════════════════════════════════════
`

    return content
  }

  // Baixar como PDF (usando print to PDF) - Agora com HTML rico e 3 vozes
  const handleDownloadPDF = async () => {
    setIsLoading(true)
    
    // Gerar QR Code se ainda não tiver
    let qrDataUrl = qrCodeDataUrl
    if (!qrDataUrl && termsAcceptance?.event_hash) {
      try {
        const verificationUrl = `${window.location.origin}/verificar/${termsAcceptance.event_hash}`
        qrDataUrl = await QRCode.toDataURL(verificationUrl, {
          width: 150,
          margin: 2,
          color: { dark: '#000000', light: '#ffffff' }
        })
      } catch (err) {
        console.error('Erro ao gerar QR:', err)
      }
    }
    
    // Criar janela de impressão com HTML rico e formatado
    const htmlContent = generateFullHTMLContent(qrDataUrl)
    const printWindow = window.open('', '_blank')
    
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      
      // Aguardar carregamento completo e imprimir
      setTimeout(() => {
        printWindow.print()
        setIsLoading(false)
      }, 800)
    } else {
      setIsLoading(false)
      alert('Não foi possível abrir a janela de impressão. Verifique se pop-ups estão permitidos.')
    }
  }

  // Imprimir diretamente
  const handlePrint = () => {
    handleDownloadPDF()
  }

  // Copiar para clipboard - texto completo com 3 vozes
  const handleCopy = async () => {
    const content = generateTextContent()
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
      alert('Não foi possível copiar. Tente novamente.')
    }
  }

  const buttonClass = isDarkMode 
    ? 'bg-slate-700 hover:bg-slate-600 text-white border-slate-600'
    : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'

  return (
    <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-gray-50'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
      <div className="flex items-center gap-2 mb-4">
        <FileDown className={`w-5 h-5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
        <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Exportar Resultado
        </h3>
      </div>

      <p className={`text-sm mb-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
        Baixe seu <strong>Mapa de Clareza completo</strong> com todas as 3 vozes (Colinho, Profissional, Defesa), 
        micro-ações, QR Code de verificação e cadeia de custódia para mostrar a profissionais.
      </p>

      {/* Info de cadeia de custódia */}
      {termsAcceptance && (
        <div className={`mb-4 p-3 rounded-lg ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'} border`}>
          <div className="flex items-center gap-2 mb-2">
            <Shield className={`w-4 h-4 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <span className={`text-xs font-medium ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
              Cadeia de Custódia Incluída
            </span>
          </div>
          <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            Termo aceito em {new Date(termsAcceptance.accepted_at).toLocaleDateString('pt-BR')} • 
            Hash: {termsAcceptance.event_hash.substring(0, 16)}...
          </p>
          
          {/* QR Code Preview */}
          {qrCodeDataUrl && (
            <div className="mt-3 flex items-center gap-3">
              <img 
                src={qrCodeDataUrl} 
                alt="QR Code de Verificação" 
                className="w-16 h-16 rounded-lg border border-slate-600"
              />
              <div>
                <p className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <QrCode className="w-3 h-3 inline mr-1" />
                  QR Code de Verificação
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  Incluído no PDF para verificar autenticidade
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleDownloadPDF}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${buttonClass}`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileDown className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">Baixar PDF</span>
        </button>

        <button
          onClick={handlePrint}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${buttonClass}`}
        >
          <Printer className="w-4 h-4" />
          <span className="text-sm font-medium">Imprimir</span>
        </button>

        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${buttonClass}`}
        >
          {copied ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">{copied ? 'Copiado!' : 'Copiar'}</span>
        </button>
      </div>
    </div>
  )
})

ClarityResultPDF.displayName = 'ClarityResultPDF'

// Helpers
function getZoneLabel(zone: string): { label: string; color: string } {
  switch (zone) {
    case 'atencao': return { label: 'Zona de Atenção', color: 'yellow' }
    case 'alerta': return { label: 'Zona de Alerta', color: 'orange' }
    case 'vermelha': return { label: 'Zona Vermelha', color: 'red' }
    default: return { label: 'Indefinido', color: 'gray' }
  }
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    invalidacao: 'Invalidação',
    gaslighting: 'Gaslighting',
    controle: 'Controle',
    isolamento: 'Isolamento',
    emocional: 'Abuso Emocional',
    fisico: 'Risco Físico'
  }
  return labels[category] || category
}

function parseDevice(ua: string): string {
  if (/iPhone/.test(ua)) return 'iPhone'
  if (/iPad/.test(ua)) return 'iPad'
  if (/Android/.test(ua)) return 'Android'
  if (/Windows/.test(ua)) return 'Windows'
  if (/Mac/.test(ua)) return 'Mac'
  if (/Linux/.test(ua)) return 'Linux'
  return 'Desktop'
}

export default ClarityResultPDF
