'use client'

import Link from 'next/link'
import { ArrowLeft, FileText, Shield, Scale } from 'lucide-react'

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </Link>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-gray-900">Termos de Uso</span>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <Scale className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Termos de Uso</h1>
          </div>
          
          <p className="text-sm text-gray-500 mb-8">
            Última atualização: 25 de novembro de 2025
          </p>

          <div className="prose prose-gray max-w-none">
            <h2>1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e usar o Radar Narcisista BR ("Plataforma"), você concorda com estes Termos de Uso. 
              Se você não concordar com qualquer parte destes termos, não deve usar a Plataforma.
            </p>

            <h2>2. Descrição do Serviço</h2>
            <p>
              O Radar Narcisista BR é uma <strong>ferramenta de apoio e autoconhecimento</strong> que oferece:
            </p>
            <ul>
              <li>Teste de Clareza para identificação de padrões</li>
              <li>Diário de Episódios para registro de eventos</li>
              <li>Coach de Clareza (IA) para apoio emocional</li>
              <li>Recursos educacionais sobre relacionamentos abusivos</li>
            </ul>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 my-6">
              <p className="text-amber-800 font-semibold mb-2">⚠️ AVISO IMPORTANTE</p>
              <p className="text-amber-700 text-sm">
                Esta Plataforma <strong>NÃO</strong> substitui acompanhamento profissional de saúde mental, 
                terapia, aconselhamento psicológico ou jurídico. <strong>NÃO</strong> fazemos diagnósticos 
                de transtornos de personalidade ou qualquer condição médica.
              </p>
            </div>

            <h2>3. Elegibilidade</h2>
            <p>
              Para usar a Plataforma, você deve:
            </p>
            <ul>
              <li>Ter pelo menos <strong>18 anos de idade</strong></li>
              <li>Ter capacidade legal para aceitar estes termos</li>
              <li>Não estar usando a Plataforma para fins ilegais ou prejudiciais</li>
            </ul>

            <h2>4. Conta de Usuário</h2>
            <p>
              Ao criar uma conta, você concorda em:
            </p>
            <ul>
              <li>Fornecer informações verdadeiras e atualizadas</li>
              <li>Manter a confidencialidade de sua senha</li>
              <li>Notificar-nos imediatamente sobre uso não autorizado</li>
              <li>Ser responsável por todas as atividades em sua conta</li>
            </ul>

            <h2>5. Uso Aceitável</h2>
            <p>Você concorda em NÃO usar a Plataforma para:</p>
            <ul>
              <li>Assediar, ameaçar ou prejudicar outras pessoas</li>
              <li>Publicar conteúdo ilegal, difamatório ou ofensivo</li>
              <li>Tentar acessar contas de outros usuários</li>
              <li>Interferir no funcionamento da Plataforma</li>
              <li>Coletar dados de outros usuários</li>
              <li>Usar para fins comerciais não autorizados</li>
            </ul>

            <h2>6. Conteúdo do Usuário</h2>
            <p>
              Você mantém a propriedade de todo conteúdo que criar na Plataforma (entradas de diário, 
              respostas de testes, etc.). Ao usar a Plataforma, você nos concede uma licença limitada 
              para armazenar e processar esse conteúdo exclusivamente para fornecer o serviço.
            </p>

            <h2>7. Inteligência Artificial</h2>
            <p>
              O Coach de Clareza utiliza inteligência artificial (OpenAI GPT-4). Você entende que:
            </p>
            <ul>
              <li>As respostas são geradas por IA, não por profissionais de saúde</li>
              <li>A IA pode cometer erros ou fornecer informações imprecisas</li>
              <li>As conversas podem ser usadas para melhorar o serviço (de forma anonimizada)</li>
              <li>Você pode desativar o salvamento de conversas nas configurações</li>
            </ul>

            <h2>8. Pagamentos e Assinaturas</h2>
            <p>
              Se você assinar um plano pago:
            </p>
            <ul>
              <li>Os pagamentos são processados pelo Stripe de forma segura</li>
              <li>As assinaturas são renovadas automaticamente</li>
              <li>Você pode cancelar a qualquer momento</li>
              <li>Não há reembolso por períodos parciais</li>
            </ul>

            <h2>9. Limitação de Responsabilidade</h2>
            <p>
              A Plataforma é fornecida "como está". Não garantimos que:
            </p>
            <ul>
              <li>O serviço será ininterrupto ou livre de erros</li>
              <li>Os resultados serão precisos ou confiáveis</li>
              <li>A Plataforma atenderá suas expectativas específicas</li>
            </ul>
            <p>
              <strong>Em nenhuma circunstância seremos responsáveis por danos indiretos, 
              incidentais ou consequenciais decorrentes do uso da Plataforma.</strong>
            </p>

            <h2>10. Situações de Emergência</h2>
            <p>
              Se você estiver em risco imediato de vida ou segurança:
            </p>
            <ul>
              <li><strong>Ligue 190</strong> (Polícia)</li>
              <li><strong>Ligue 188</strong> (CVV - Centro de Valorização da Vida)</li>
              <li><strong>Ligue 180</strong> (Central de Atendimento à Mulher)</li>
            </ul>
            <p>
              A Plataforma NÃO é um serviço de emergência e não deve ser usada em situações de crise imediata.
            </p>

            <h2>11. Modificações</h2>
            <p>
              Podemos modificar estes Termos a qualquer momento. Notificaremos sobre mudanças 
              significativas por email ou através da Plataforma. O uso continuado após as 
              modificações constitui aceitação dos novos termos.
            </p>

            <h2>12. Rescisão</h2>
            <p>
              Podemos suspender ou encerrar sua conta se você violar estes Termos. 
              Você pode encerrar sua conta a qualquer momento nas configurações.
            </p>

            <h2>13. Lei Aplicável</h2>
            <p>
              Estes Termos são regidos pelas leis da República Federativa do Brasil. 
              Qualquer disputa será resolvida nos tribunais de São Paulo, SP.
            </p>

            <h2>14. Contato</h2>
            <p>
              Para dúvidas sobre estes Termos:
            </p>
            <ul>
              <li>Email: <a href="mailto:legal@radarnarcisista.br">legal@radarnarcisista.br</a></li>
            </ul>
          </div>

          {/* Links relacionados */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">Documentos relacionados:</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/privacidade" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700">
                <Shield className="w-4 h-4" />
                Política de Privacidade
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
