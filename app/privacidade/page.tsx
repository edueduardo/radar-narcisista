'use client'

import Link from 'next/link'
import { ArrowLeft, Shield, FileText, Lock, Eye, Trash2, Download, User, Mail, Phone } from 'lucide-react'

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="font-semibold text-gray-900 dark:text-white">Politica de Privacidade</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Compromisso LGPD */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-8 border-l-4 border-purple-500">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Lock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Nosso Compromisso LGPD
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            O Radar Narcisista BR estÃ¡ em <strong>total conformidade</strong> com a Lei Geral de ProteÃ§Ã£o de Dados (Lei nÂº 13.709/2018). 
            Respeitamos sua privacidade e tratamos seus dados pessoais com transparÃªncia, seguranÃ§a e responsabilidade.
          </p>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <p className="text-sm text-purple-800 dark:text-purple-200">
              <strong>Data da Ãºltima atualizaÃ§Ã£o:</strong> {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
        </section>

        {/* Dados Coletados */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Quais Dados Coletamos
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Dados Essenciais</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Email (para login e recuperaÃ§Ã£o)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Nome de usuÃ¡rio
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Data de registro e Ãºltimo acesso
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  EndereÃ§o IP (anonimizado)
                </li>
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Dados do DiÃ¡rio</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  EpisÃ³dios registrados
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  AnÃ¡lises da IA
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Respostas ao Teste de Clareza
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  InteraÃ§Ãµes com o Coach IA
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Seus Direitos LGPD */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Seus Direitos (LGPD)
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Direito de Acesso</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Saber quais dados temos sobre vocÃª e como sÃ£o usados.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Download className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Direito de Portabilidade</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receber seus dados em formato legÃ­vel para outras plataformas.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Trash2 className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Direito de EliminaÃ§Ã£o</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Solicitar exclusÃ£o permanente de seus dados.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Direito de RetificaÃ§Ã£o</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Corrigir informaÃ§Ãµes incompletas ou incorretas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SeguranÃ§a */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Como Protegemos Seus Dados</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-gray-700 dark:text-gray-300">
                <strong>Criptografia de ponta a ponta</strong> (SSL/TLS) em todas as conexÃµes
              </span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-gray-700 dark:text-gray-300">
                <strong>Servidores seguros</strong> e monitorados 24/7
              </span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-gray-700 dark:text-gray-300">
                <strong>Acesso restrito</strong> Ã  equipe autorizada e treinada
              </span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-gray-700 dark:text-gray-300">
                <strong>Backups automÃ¡ticos</strong> e criptografados diariamente
              </span>
            </div>
          </div>
        </section>

        {/* Contato */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Exercer Seus Direitos</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Para exercer seus direitos ou tirar dÃºvidas sobre esta polÃ­tica, entre em contato:
          </p>
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Email:</span>
                <span className="ml-2 text-gray-700 dark:text-gray-300">
                  privacidade@radarnarcisista.com.br
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Prazo de resposta:</span>
                <span className="ml-2 text-gray-700 dark:text-gray-300">
                  AtÃ© 15 dias corridos (conforme LGPD)
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Importante:</strong> Em caso de emergÃªncia imediata, ligue 190 (PolÃ­cia), 180 (Central de Atendimento Ã  Mulher) ou 188 (Disque SaÃºde).
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
