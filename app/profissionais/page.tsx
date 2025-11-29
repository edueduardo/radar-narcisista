'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Shield, 
  FileText, 
  Users, 
  Lock, 
  Hash, 
  BarChart3, 
  CheckCircle,
  Building,
  GraduationCap,
  Heart,
  Scale,
  ChevronRight,
  Mail,
  Phone
} from 'lucide-react'

export default function ProfissionaisPage() {
  const [activeTab, setActiveTab] = useState<'psicologos' | 'advogados' | 'pesquisadores' | 'parceiros'>('psicologos')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar ao site
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-900 to-indigo-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6">
            <Building className="w-4 h-4" />
            <span className="text-sm font-medium">Para Profissionais</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Radar Narcisista BR<br />
            <span className="text-purple-300">Informações Técnicas</span>
          </h1>
          
          <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-8">
            Documentação técnica, recursos para profissionais de saúde mental, 
            advogados, pesquisadores e potenciais parceiros.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a href="#recursos" className="bg-white text-purple-700 px-6 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-colors">
              Ver Recursos
            </a>
            <a href="#contato" className="border-2 border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors">
              Entrar em Contato
            </a>
          </div>
        </div>
      </section>

      {/* Navegação por abas */}
      <section className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex overflow-x-auto gap-1 py-2">
            {[
              { id: 'psicologos', label: 'Psicólogos', icon: Heart },
              { id: 'advogados', label: 'Advogados', icon: Scale },
              { id: 'pesquisadores', label: 'Pesquisadores', icon: GraduationCap },
              { id: 'parceiros', label: 'Parceiros', icon: Building },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Conteúdo das abas */}
      <section id="recursos" className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          
          {/* Psicólogos */}
          {activeTab === 'psicologos' && (
            <div className="space-y-8">
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <Heart className="w-7 h-7 text-purple-500" />
                  Para Psicólogos e Terapeutas
                </h2>
                
                <div className="prose max-w-none text-gray-600">
                  <p className="text-lg mb-6">
                    O Radar Narcisista BR é uma <strong>ferramenta complementar</strong> que pode auxiliar 
                    no acompanhamento de pacientes que vivenciam ou vivenciaram relacionamentos abusivos.
                  </p>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                    <p className="text-amber-800 text-sm">
                      <strong>⚠️ Importante:</strong> O Radar NÃO faz diagnósticos de Transtorno de Personalidade 
                      Narcisista (TPN) ou qualquer outro transtorno. É uma ferramenta de autoconhecimento e registro.
                    </p>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Como pode auxiliar no tratamento:</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { title: 'Diário de Episódios', desc: 'Paciente registra eventos entre sessões, facilitando a discussão em terapia' },
                      { title: 'Teste de Clareza', desc: 'Ajuda o paciente a organizar percepções antes de verbalizar' },
                      { title: 'Linha do Tempo', desc: 'Visualização cronológica de padrões de comportamento' },
                      { title: 'Relatórios PDF', desc: 'Paciente pode compartilhar registros com o terapeuta' },
                    ].map((item, i) => (
                      <div key={i} className="bg-purple-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    ))}
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Base teórica:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Desenvolvido com base em literatura sobre abuso psicológico e narcisismo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Referências: DSM-5, trabalhos de Lundy Bancroft, Dr. Ramani Durvasula</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>IA treinada para NÃO fazer diagnósticos ou dar conselhos médicos</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Advogados */}
          {activeTab === 'advogados' && (
            <div className="space-y-8">
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <Scale className="w-7 h-7 text-purple-500" />
                  Para Advogados
                </h2>
                
                <div className="prose max-w-none text-gray-600">
                  <p className="text-lg mb-6">
                    O Radar pode ser útil como ferramenta de <strong>documentação</strong> em casos 
                    de violência psicológica, alienação parental e disputas de guarda.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Recursos para documentação:</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { 
                        title: 'Hash de Integridade', 
                        desc: 'Cada entrada do diário gera um hash SHA-256 que comprova que o conteúdo não foi alterado',
                        icon: Hash
                      },
                      { 
                        title: 'Timestamps Verificáveis', 
                        desc: 'Data e hora de criação registradas no servidor, não no dispositivo do usuário',
                        icon: FileText
                      },
                      { 
                        title: 'Relatórios PDF', 
                        desc: 'Exportação formatada com metadados para uso como evidência documental',
                        icon: FileText
                      },
                      { 
                        title: 'Anexos', 
                        desc: 'Possibilidade de anexar prints, áudios e fotos aos registros',
                        icon: Lock
                      },
                    ].map((item, i) => {
                      const Icon = item.icon
                      return (
                        <div key={i} className="bg-blue-50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="w-5 h-5 text-blue-600" />
                            <h4 className="font-semibold text-gray-900">{item.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                      )
                    })}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
                    <p className="text-blue-800 text-sm">
                      <strong>📋 Nota:</strong> A admissibilidade de registros digitais como prova varia 
                      conforme a jurisdição. Consulte a legislação local sobre provas eletrônicas.
                    </p>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Lei Maria da Penha (Lei 11.340/2006):</h3>
                  <p>
                    A violência psicológica é reconhecida como forma de violência doméstica. 
                    O Radar pode auxiliar vítimas a documentar padrões de comportamento abusivo 
                    para subsidiar medidas protetivas e ações judiciais.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pesquisadores */}
          {activeTab === 'pesquisadores' && (
            <div className="space-y-8">
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <GraduationCap className="w-7 h-7 text-purple-500" />
                  Para Pesquisadores
                </h2>
                
                <div className="prose max-w-none text-gray-600">
                  <p className="text-lg mb-6">
                    Disponibilizamos dados agregados e anonimizados para pesquisa acadêmica 
                    sobre abuso psicológico e relacionamentos tóxicos.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Dados disponíveis (agregados):</h3>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { title: 'Estatísticas de Testes', desc: 'Distribuição de resultados por faixa etária, gênero, região' },
                      { title: 'Padrões de Uso', desc: 'Frequência de registros, horários, dispositivos' },
                      { title: 'Categorias de Episódios', desc: 'Tipos de abuso mais reportados (gaslighting, etc.)' },
                    ].map((item, i) => (
                      <div key={i} className="bg-green-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-6">
                    <p className="text-green-800 text-sm">
                      <strong>🔒 Privacidade:</strong> Todos os dados são anonimizados e agregados. 
                      Nenhum dado individual é compartilhado. Pesquisas requerem aprovação de comitê de ética.
                    </p>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Como solicitar acesso:</h3>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Envie email para pesquisa@radarnarcisista.br</li>
                    <li>Inclua: instituição, objetivo da pesquisa, aprovação do comitê de ética</li>
                    <li>Aguarde análise (até 15 dias úteis)</li>
                    <li>Assine termo de uso de dados</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Parceiros */}
          {activeTab === 'parceiros' && (
            <div className="space-y-8">
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <Building className="w-7 h-7 text-purple-500" />
                  Parcerias e White-Label
                </h2>
                
                <div className="prose max-w-none text-gray-600">
                  <p className="text-lg mb-6">
                    Oferecemos soluções de parceria para clínicas, ONGs, 
                    instituições de ensino e empresas.
                  </p>

                  <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Modelos de parceria:</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="border-2 border-purple-200 rounded-xl p-6">
                      <h4 className="text-lg font-bold text-purple-700 mb-2">🏥 Clínicas e Consultórios</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Acesso Premium para pacientes</li>
                        <li>• Dashboard de acompanhamento</li>
                        <li>• Relatórios compartilhados</li>
                        <li>• Treinamento para equipe</li>
                      </ul>
                    </div>
                    
                    <div className="border-2 border-blue-200 rounded-xl p-6">
                      <h4 className="text-lg font-bold text-blue-700 mb-2">🤝 ONGs e Instituições</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Licença gratuita ou subsidiada</li>
                        <li>• Customização de conteúdo</li>
                        <li>• Integração com sistemas existentes</li>
                        <li>• Suporte dedicado</li>
                      </ul>
                    </div>
                    
                    <div className="border-2 border-green-200 rounded-xl p-6">
                      <h4 className="text-lg font-bold text-green-700 mb-2">🏢 Empresas (RH)</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Programa de bem-estar</li>
                        <li>• Acesso anônimo para funcionários</li>
                        <li>• Relatórios agregados (sem identificação)</li>
                        <li>• Palestras e workshops</li>
                      </ul>
                    </div>
                    
                    <div className="border-2 border-orange-200 rounded-xl p-6">
                      <h4 className="text-lg font-bold text-orange-700 mb-2">🏷️ White-Label</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Sua marca, nossa tecnologia</li>
                        <li>• Customização completa de UI</li>
                        <li>• Hospedagem dedicada</li>
                        <li>• API para integrações</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Stack Técnico */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Stack Tecnológico</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Next.js 15', desc: 'Framework React', emoji: '⚛️' },
              { name: 'TypeScript', desc: 'Tipagem estática', emoji: '📘' },
              { name: 'Supabase', desc: 'Backend + Auth', emoji: '🗄️' },
              { name: 'OpenAI GPT-4', desc: 'IA conversacional', emoji: '🤖' },
              { name: 'PostgreSQL', desc: 'Banco de dados', emoji: '🐘' },
              { name: 'Tailwind CSS', desc: 'Estilização', emoji: '🎨' },
              { name: 'Vercel', desc: 'Hospedagem', emoji: '▲' },
              { name: 'Stripe', desc: 'Pagamentos', emoji: '💳' },
            ].map((tech, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl mb-2">{tech.emoji}</p>
                <p className="font-semibold text-gray-900">{tech.name}</p>
                <p className="text-xs text-gray-500">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="py-12 bg-gradient-to-br from-purple-900 to-indigo-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Entre em Contato</h2>
          <p className="text-purple-200 mb-8">
            Interessado em parceria, pesquisa ou tem dúvidas técnicas?
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <a 
              href="mailto:parcerias@radarnarcisista.br"
              className="bg-white/10 rounded-xl p-6 hover:bg-white/20 transition-colors block"
            >
              <Mail className="w-8 h-8 mx-auto mb-3 text-purple-300" />
              <p className="font-semibold">Parcerias</p>
              <p className="text-sm text-purple-200">parcerias@radarnarcisista.br</p>
            </a>
            
            <a 
              href="mailto:pesquisa@radarnarcisista.br"
              className="bg-white/10 rounded-xl p-6 hover:bg-white/20 transition-colors block"
            >
              <GraduationCap className="w-8 h-8 mx-auto mb-3 text-purple-300" />
              <p className="font-semibold">Pesquisa Acadêmica</p>
              <p className="text-sm text-purple-200">pesquisa@radarnarcisista.br</p>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm">
          <p>© 2024 Radar Narcisista BR. Todos os direitos reservados.</p>
          <p className="mt-2">
            <Link href="/" className="hover:text-white">Voltar ao site</Link>
            {' • '}
            <Link href="/termos" className="hover:text-white">Termos de Uso</Link>
            {' • '}
            <Link href="/privacidade" className="hover:text-white">Privacidade</Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
