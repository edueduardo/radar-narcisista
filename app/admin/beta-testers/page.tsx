'use client'

import { useState } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import { 
  Users, 
  Copy, 
  Check, 
  MessageSquare, 
  UserCheck, 
  Briefcase, 
  Heart,
  AlertTriangle,
  Gift,
  Clock,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Phone,
  Mail,
  Instagram,
  FileText,
  Sparkles
} from 'lucide-react'

// ============================================
// SCRIPTS DE CONVITE
// ============================================

const SCRIPTS = {
  pessoasProximas: {
    titulo: 'Pessoas Próximas (Grupo A/C)',
    descricao: 'Para amigos, conhecidos ou pessoas que já comentaram sobre relacionamentos difíceis',
    texto: `Oi, tudo bem?

Estou terminando um projeto importante pra mim: um app chamado Radar Narcisista BR.

É uma plataforma 100% confidencial com três coisas:
– um Teste de Clareza sobre relações abusivas,
– um Diário de Episódios (texto/áudio),
– um chat com IA acolhedora para organizar os pensamentos.

Antes de lançar pra muita gente, quero testar com poucas pessoas de confiança, ver se faz sentido, se algo assusta, se ajuda de verdade.

Você toparia entrar no site, fazer o teste e registrar 1 episódio no diário, e depois me contar o que achou?

Se topar, eu te dou acesso à versão completa depois, sem custo.

Se não tiver cabeça pra isso agora, tudo bem também. 💜`
  },
  profissionais: {
    titulo: 'Profissionais (Grupo B)',
    descricao: 'Para psicólogos, terapeutas, advogados de família',
    texto: `Oi, [NOME], tudo bem?

Eu estou desenvolvendo um app chamado Radar Narcisista BR.

É uma ferramenta anônima e criptografada pra pessoas em relações abusivas organizarem o que estão vivendo:
– um Teste de Clareza (18 perguntas),
– um Diário de Episódios (texto/áudio),
– um chat com IA acolhedora que não faz diagnóstico, só organiza e orienta sobre limites e segurança.

Antes de lançar, eu queria muito um olhar profissional:
– se a linguagem é segura,
– se há algum risco ético,
– se isso poderia complementar o trabalho terapêutico ou jurídico.

Você toparia testar o app por 15–20 minutos e me mandar um feedback curto? Em troca, deixo acesso liberado pra você e, se fizer sentido, podemos pensar em parceria pra pacientes/clientes.

Se preferir, posso te mandar um PDF com a descrição antes.`
  },
  membrosFundadores: {
    titulo: 'Membros Fundadores (Redes Sociais)',
    descricao: 'Para postar quando estiver pronto para abrir para mais pessoas',
    texto: `🚀 Procuro 20 Membros Fundadores para o Radar Narcisista BR

Estou lançando uma ferramenta 100% confidencial para quem vive ou viveu relações abusivas:

✅ Teste de Clareza (entender o que está acontecendo)
✅ Diário de Episódios (registrar sem julgamento)
✅ Chat com IA acolhedora (organizar pensamentos)

🎁 O que você ganha como Membro Fundador:
• Acesso vitalício ao plano Premium
• Participação no grupo exclusivo de fundadores
• Influência direta nas próximas features

📋 O que eu peço:
• Testar o app por 15-20 minutos
• Me contar o que funcionou e o que confundiu
• Ser 18+ e não estar em situação de crise aguda

⚠️ Importante: Isso NÃO substitui terapia ou atendimento de emergência. É uma ferramenta de organização e clareza.

Interessado(a)? Comenta "EU" ou me manda DM 💜

#saudemental #relacionamentoabusivo #narcisismo`
  },
  followUp: {
    titulo: 'Follow-up após teste',
    descricao: 'Para enviar depois que a pessoa testou',
    texto: `Oi! Muito obrigado(a) por testar o Radar Narcisista BR! 💜

Quando puder, me conta:

1. O que te ajudou de verdade?
2. O que te deixou confuso(a) ou inseguro(a)?
3. Teve algum momento que você pensou em desistir? Qual?
4. Se eu cobrasse R$ 29/mês, você pagaria? Por quê?

Pode ser por áudio, texto, como preferir. Qualquer feedback ajuda muito!

E lembra: seu acesso Premium já está garantido como agradecimento. 🙏`
  }
}

const ROTEIRO_ENTREVISTA = [
  { num: 1, pergunta: 'Como você descobriu que estava em uma relação abusiva? (ou: o que te fez suspeitar?)' },
  { num: 2, pergunta: 'O que você achou do Teste de Clareza? O resultado fez sentido?' },
  { num: 3, pergunta: 'Você usaria o Diário de Episódios? Por quê?' },
  { num: 4, pergunta: 'O que achou do Chat com IA? A linguagem te acolheu?' },
  { num: 5, pergunta: 'Em algum momento você sentiu medo de usar o app? (privacidade, ser descoberta, etc.)' },
  { num: 6, pergunta: 'O que mais te ajudou no app?' },
  { num: 7, pergunta: 'O que mais te confundiu ou frustrou?' },
  { num: 8, pergunta: 'Faltou alguma coisa que você gostaria de ter?' },
  { num: 9, pergunta: 'Você indicaria isso para uma amiga na mesma situação?' },
  { num: 10, pergunta: 'Se custasse R$ 29/mês, você pagaria? O que justificaria esse valor?' },
]

const CANAIS_EMERGENCIA = [
  { nome: 'CVV (Suicídio)', numero: '188', descricao: 'Centro de Valorização da Vida - 24h' },
  { nome: 'Ligue 180', numero: '180', descricao: 'Central de Atendimento à Mulher - 24h' },
  { nome: 'Polícia', numero: '190', descricao: 'Emergência policial' },
  { nome: 'SAMU', numero: '192', descricao: 'Emergência médica' },
]

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function BetaTestersPage() {
  const [copiedScript, setCopiedScript] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<string[]>(['scripts', 'grupos'])
  const [testersList, setTestersList] = useState<string>('')

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedScript(id)
    setTimeout(() => setCopiedScript(null), 2000)
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const isExpanded = (section: string) => expandedSections.includes(section)

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <AdminSidebar />
      
      <main className="flex-1 p-8 ml-52 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-green-500" />
              Guia de Beta Testers
            </h1>
            <p className="text-gray-400 mt-1">
              Como recrutar, convidar e coletar feedback de pessoas reais
            </p>
          </div>

          {/* Resumo Rápido */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">📋 Resumo: O que fazer agora</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-green-100 font-medium">1. Fazer lista com 10 nomes</p>
                <p className="text-green-200 text-sm">Amigos, contatos, profissionais</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-green-100 font-medium">2. Escolher 3 e mandar script HOJE</p>
                <p className="text-green-200 text-sm">Use os scripts prontos abaixo</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-green-100 font-medium">3. Subir app em produção</p>
                <p className="text-green-200 text-sm">Vercel + Supabase + OpenAI reais</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-green-100 font-medium">4. Agendar 1-2 calls</p>
                <p className="text-green-200 text-sm">Ver alguém usando "ao vivo"</p>
              </div>
            </div>
          </div>

          {/* Seção: Grupos de Testers */}
          <div className="bg-gray-800 rounded-xl mb-6 overflow-hidden">
            <button
              onClick={() => toggleSection('grupos')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-700/50"
            >
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-400" />
                Quem chamar? (3 Grupos)
              </h2>
              {isExpanded('grupos') ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
            </button>
            
            {isExpanded('grupos') && (
              <div className="p-4 pt-0 space-y-4">
                {/* Grupo A */}
                <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-5 h-5 text-pink-400" />
                    <h3 className="font-semibold text-pink-300">Grupo A – Pessoas que viveram/suspeitam de abuso</h3>
                  </div>
                  <ul className="text-gray-300 text-sm space-y-1 ml-7">
                    <li>• Seguem páginas sobre narcisismo</li>
                    <li>• Já falaram com você sobre isso</li>
                    <li>• Vivem/viveram relações confusas</li>
                  </ul>
                  <p className="text-yellow-400 text-sm mt-2 ml-7">
                    ⚠️ Condição: 18+ e NÃO em crise aguda
                  </p>
                </div>

                {/* Grupo B */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-5 h-5 text-blue-400" />
                    <h3 className="font-semibold text-blue-300">Grupo B – Profissionais</h3>
                  </div>
                  <ul className="text-gray-300 text-sm space-y-1 ml-7">
                    <li>• Psicólogas(os)</li>
                    <li>• Advogados de família</li>
                    <li>• Terapeutas de casal</li>
                    <li>• Pessoas que acompanham vítimas</li>
                  </ul>
                  <p className="text-blue-200 text-sm mt-2 ml-7">
                    💡 Olhar: "Isso ajuda meu paciente? O que falta?"
                  </p>
                </div>

                {/* Grupo C */}
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    <h3 className="font-semibold text-purple-300">Grupo C – Gente "neutra" (usabilidade)</h3>
                  </div>
                  <ul className="text-gray-300 text-sm space-y-1 ml-7">
                    <li>• Amigos que NÃO estão passando por abuso</li>
                    <li>• Conseguem clicar, testar, navegar</li>
                    <li>• Dizem o que ficou confuso na interface</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Seção: Onde Achar */}
          <div className="bg-gray-800 rounded-xl mb-6 overflow-hidden">
            <button
              onClick={() => toggleSection('onde')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-700/50"
            >
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-orange-400" />
                Onde achar essas pessoas?
              </h2>
              {isExpanded('onde') ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
            </button>
            
            {isExpanded('onde') && (
              <div className="p-4 pt-0 space-y-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">1. Rede que você já tem (começa aqui!)</h3>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Amigos próximos</li>
                    <li>• Contatos do WhatsApp</li>
                    <li>• Gente que já comentou sobre relacionamento abusivo</li>
                  </ul>
                  <p className="text-green-400 text-sm mt-2">
                    ✅ Escolha 5-10 nomes e mande mensagem INDIVIDUAL
                  </p>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">2. Profissionais</h3>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Psicólogas que você segue no Instagram</li>
                    <li>• Quem fala de narcisismo, abuso emocional</li>
                  </ul>
                  <p className="text-blue-400 text-sm mt-2">
                    📩 DM no Instagram, e-mail ou formulário de contato
                  </p>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">3. Audiência fria (2ª rodada)</h3>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Comentários em perfis sobre narcisismo</li>
                    <li>• Pedir para criadores testarem primeiro</li>
                  </ul>
                  <p className="text-yellow-400 text-sm mt-2">
                    ⚠️ Nunca "caçar vítimas" - sempre como ferramenta de clareza
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Seção: Scripts de Convite */}
          <div className="bg-gray-800 rounded-xl mb-6 overflow-hidden">
            <button
              onClick={() => toggleSection('scripts')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-700/50"
            >
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-400" />
                Scripts de Convite (copie e use!)
              </h2>
              {isExpanded('scripts') ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
            </button>
            
            {isExpanded('scripts') && (
              <div className="p-4 pt-0 space-y-4">
                {Object.entries(SCRIPTS).map(([key, script]) => (
                  <div key={key} className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-white">{script.titulo}</h3>
                        <p className="text-gray-400 text-sm">{script.descricao}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(script.texto, key)}
                        className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition ${
                          copiedScript === key 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-600 text-white hover:bg-gray-500'
                        }`}
                      >
                        {copiedScript === key ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copiar
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="bg-gray-900 rounded-lg p-4 text-gray-300 text-sm whitespace-pre-wrap overflow-x-auto max-h-60 overflow-y-auto">
                      {script.texto}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Seção: Timing */}
          <div className="bg-gray-800 rounded-xl mb-6 overflow-hidden">
            <button
              onClick={() => toggleSection('timing')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-700/50"
            >
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                Quando fazer? (Timing)
              </h2>
              {isExpanded('timing') ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
            </button>
            
            {isExpanded('timing') && (
              <div className="p-4 pt-0">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">1</span>
                    <div>
                      <p className="text-white font-medium">Terminar QA básico</p>
                      <p className="text-gray-400 text-sm">Tudo funcionando sem erros</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">2</span>
                    <div>
                      <p className="text-white font-medium">Subir em produção</p>
                      <p className="text-gray-400 text-sm">Vercel + Supabase real + OpenAI real</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">3</span>
                    <div>
                      <p className="text-white font-medium">Primeiro grupo: 2-3 pessoas muito próximas</p>
                      <p className="text-gray-400 text-sm">Só pra ver se nada quebra</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">4</span>
                    <div>
                      <p className="text-white font-medium">Ajustar pequenos bugs</p>
                      <p className="text-gray-400 text-sm">Corrigir o que aparecer</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">5</span>
                    <div>
                      <p className="text-white font-medium">Segundo grupo: até 10 pessoas</p>
                      <p className="text-gray-400 text-sm">Mistura Grupo A + C + 2-3 profissionais</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-300 text-sm">
                    💡 Não mande pra muita gente de primeira. Melhor corrigir rápido com poucos.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Seção: Roteiro de Entrevista */}
          <div className="bg-gray-800 rounded-xl mb-6 overflow-hidden">
            <button
              onClick={() => toggleSection('roteiro')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-700/50"
            >
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-purple-400" />
                Roteiro de Entrevista (10 perguntas)
              </h2>
              {isExpanded('roteiro') ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
            </button>
            
            {isExpanded('roteiro') && (
              <div className="p-4 pt-0">
                <p className="text-gray-400 text-sm mb-4">
                  Use essas perguntas depois que a pessoa testar o app:
                </p>
                <div className="space-y-2">
                  {ROTEIRO_ENTREVISTA.map((item) => (
                    <div key={item.num} className="flex items-start gap-3 p-3 bg-gray-700/50 rounded-lg">
                      <span className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {item.num}
                      </span>
                      <p className="text-gray-200 text-sm">{item.pergunta}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => copyToClipboard(ROTEIRO_ENTREVISTA.map(i => `${i.num}. ${i.pergunta}`).join('\n\n'), 'roteiro')}
                  className={`mt-4 w-full py-2 rounded-lg flex items-center justify-center gap-2 transition ${
                    copiedScript === 'roteiro' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-purple-600 text-white hover:bg-purple-500'
                  }`}
                >
                  {copiedScript === 'roteiro' ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar todas as perguntas
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Seção: O que dar em troca */}
          <div className="bg-gray-800 rounded-xl mb-6 overflow-hidden">
            <button
              onClick={() => toggleSection('incentivo')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-700/50"
            >
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-pink-400" />
                O que dar em troca (Incentivos)
              </h2>
              {isExpanded('incentivo') ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
            </button>
            
            {isExpanded('incentivo') && (
              <div className="p-4 pt-0 space-y-3">
                <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-lg p-4">
                  <h3 className="font-semibold text-pink-300 mb-2">🎁 Para todos os beta testers:</h3>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Acesso vitalício ao plano Premium</li>
                    <li>• Convite para grupo exclusivo de "fundadores"</li>
                    <li>• Prioridade para testar novas features</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-300 mb-2">👩‍⚕️ Para profissionais:</h3>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Acesso full permanente</li>
                    <li>• Nome no "Portal Parceiros" (se fizer sentido)</li>
                    <li>• Possibilidade de indicar para pacientes/clientes</li>
                  </ul>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-300 text-sm italic">
                    "Ainda é beta, pode ter bug. Em troca, você ganha acesso completo e me ajuda a ajustar pra ajudar mais gente."
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Seção: Cuidados Éticos */}
          <div className="bg-gray-800 rounded-xl mb-6 overflow-hidden">
            <button
              onClick={() => toggleSection('etica')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-700/50"
            >
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Cuidados Éticos IMPORTANTES
              </h2>
              {isExpanded('etica') ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
            </button>
            
            {isExpanded('etica') && (
              <div className="p-4 pt-0 space-y-4">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <h3 className="font-semibold text-red-300 mb-2">⚠️ Sempre deixar claro:</h3>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Apenas para maiores de 18 anos</li>
                    <li>• NÃO é atendimento de emergência</li>
                    <li>• NÃO substitui terapia ou denúncia</li>
                  </ul>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-300 mb-2">🚨 Se alguém contar algo MUITO pesado:</h3>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Você NÃO vira terapeuta</li>
                    <li>• Reforce os canais oficiais</li>
                    <li>• Oriente buscar rede de apoio real</li>
                  </ul>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">📞 Canais de Emergência:</h3>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {CANAIS_EMERGENCIA.map((canal) => (
                      <div key={canal.numero} className="bg-gray-800 rounded-lg p-3">
                        <p className="text-white font-bold text-lg">{canal.numero}</p>
                        <p className="text-gray-300 text-sm">{canal.nome}</p>
                        <p className="text-gray-500 text-xs">{canal.descricao}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4">
                  <h3 className="font-semibold text-red-300 mb-2">❌ NUNCA usar frases tipo:</h3>
                  <ul className="text-red-200 text-sm space-y-1">
                    <li>• "Isso vai curar você"</li>
                    <li>• "Você finalmente vai se livrar dele"</li>
                    <li>• Qualquer promessa de resultado</li>
                  </ul>
                  <p className="text-green-300 text-sm mt-2">
                    ✅ Foque em: clareza, organização, apoio, segurança
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Área de Anotações */}
          <div className="bg-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-cyan-400" />
              Minha Lista de Beta Testers
            </h2>
            <p className="text-gray-400 text-sm mb-3">
              Anote aqui os nomes das pessoas que você vai convidar:
            </p>
            <textarea
              value={testersList}
              onChange={(e) => setTestersList(e.target.value)}
              placeholder="1. Maria (amiga) - WhatsApp&#10;2. Dr. João (psicólogo) - Instagram&#10;3. Ana (conhecida) - Email&#10;..."
              className="w-full h-40 bg-gray-900 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 resize-none"
            />
            <p className="text-gray-500 text-xs mt-2">
              💡 Esta lista é salva apenas no seu navegador
            </p>
          </div>

          {/* CTA Final */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-center">
            <Sparkles className="w-12 h-12 text-white mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Pronto para começar?</h2>
            <p className="text-green-100 mb-4">
              Escolha 3 pessoas da sua lista e mande o primeiro script HOJE!
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => copyToClipboard(SCRIPTS.pessoasProximas.texto, 'cta-proximas')}
                className="px-6 py-3 bg-white text-green-700 font-semibold rounded-lg hover:bg-green-50 transition"
              >
                {copiedScript === 'cta-proximas' ? '✓ Copiado!' : 'Copiar Script Amigos'}
              </button>
              <button
                onClick={() => copyToClipboard(SCRIPTS.profissionais.texto, 'cta-prof')}
                className="px-6 py-3 bg-green-800 text-white font-semibold rounded-lg hover:bg-green-700 transition"
              >
                {copiedScript === 'cta-prof' ? '✓ Copiado!' : 'Copiar Script Profissionais'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
