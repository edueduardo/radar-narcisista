import type { Metadata } from "next"
import Link from "next/link"
import { Shield, Brain, Lock, Eye, Trash2, Mail } from "lucide-react"

export const metadata: Metadata = {
  title: "Dados e Inteligência Artificial | Radar Narcisista BR",
  description: "Entenda como o Radar Narcisista BR utiliza dados e inteligência artificial de forma responsável e transparente.",
}

export default function DadosEIAPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 py-16">
      <div className="max-w-3xl mx-auto px-4 space-y-10">
        {/* Header */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-4">
            <Brain className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Dados e Inteligência Artificial
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transparência total sobre como usamos seus dados e IA no Radar Narcisista BR.
          </p>
        </header>

        {/* Seção 1 */}
        <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <Brain className="w-6 h-6 text-purple-600" />
            1. O que a IA faz no Radar?
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-purple-600 mt-1">•</span>
              <span>Gera respostas no <strong>Coach de Clareza (IA)</strong>, a partir das mensagens que você envia.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 mt-1">•</span>
              <span>Ajuda a organizar informações em testes, diários e relatórios, em linguagem mais clara.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 mt-1">•</span>
              <span>Gera métricas agregadas e anonimizadas para melhorar o produto ao longo do tempo.</span>
            </li>
          </ul>
        </section>

        {/* Seção 2 */}
        <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <Shield className="w-6 h-6 text-green-600" />
            2. O que NÃO fazemos
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-red-500 mt-1">✗</span>
              <span>Não usamos suas histórias individuais para fazer anúncios personalizados.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-500 mt-1">✗</span>
              <span>Não vendemos seus dados pessoais para terceiros.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-500 mt-1">✗</span>
              <span>Não permitimos que modelos de IA treinem livremente em textos identificáveis sem anonimização.</span>
            </li>
          </ul>
        </section>

        {/* Seção 3 */}
        <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <Eye className="w-6 h-6 text-blue-600" />
            3. Dados derivados e aprendizado
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Podemos gerar <strong>dados derivados</strong> (por exemplo: estatísticas de uso, 
            temas mais comuns, métricas agregadas), sem expor o conteúdo cru das suas mensagens. 
            Esses dados ajudam a ajustar o Radar, priorizar melhorias e entender onde a 
            ferramenta está ajudando mais.
          </p>
        </section>

        {/* Seção 4 */}
        <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <Lock className="w-6 h-6 text-purple-600" />
            4. Seus controles
          </h2>
          <p className="text-gray-700 mb-4">
            Você tem acesso a configurações de privacidade onde pode:
          </p>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-green-500 mt-1">✓</span>
              <span>Decidir se quer manter histórico ou usar modo mais efêmero</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 mt-1">✓</span>
              <span>Optar por permitir ou não que seus dados contribuam para estatísticas</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 mt-1">✓</span>
              <span>Solicitar exclusão de conta e dos dados associados a qualquer momento</span>
            </li>
          </ul>
        </section>

        {/* Seção 5 */}
        <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <Trash2 className="w-6 h-6 text-red-600" />
            5. Como apagar seus dados
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Você pode solicitar a exclusão completa dos seus dados a qualquer momento. 
            Basta acessar <Link href="/configuracoes" className="text-purple-600 underline">Configurações</Link> ou 
            enviar um e-mail para nosso time de privacidade.
          </p>
        </section>

        {/* Contato */}
        <section className="bg-purple-50 rounded-2xl p-6 md:p-8 border border-purple-100 text-center">
          <Mail className="w-8 h-8 text-purple-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Dúvidas sobre dados e IA?
          </h2>
          <p className="text-gray-700 mb-4">
            Preferimos excesso de transparência a deixar você na dúvida.
          </p>
          <a 
            href="mailto:privacidade@radarnarcisista.com.br"
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors"
          >
            <Mail className="w-5 h-5" />
            privacidade@radarnarcisista.com.br
          </a>
        </section>

        {/* Links relacionados */}
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <Link href="/privacidade" className="text-purple-600 hover:underline">
            Política de Privacidade
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/termos" className="text-purple-600 hover:underline">
            Termos de Uso
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/seguranca" className="text-purple-600 hover:underline">
            Segurança
          </Link>
        </div>
      </div>
    </main>
  )
}
