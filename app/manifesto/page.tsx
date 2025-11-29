'use client'

import Link from 'next/link'
import { 
  Heart, 
  Shield, 
  Scale, 
  Eye, 
  Users, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Brain,
  MessageCircle,
  FileText,
  ArrowLeft,
  Sparkles
} from 'lucide-react'

// ============================================================================
// PÁGINA: A ALMA DO RADAR NARCISISTA BR
// Manifesto público explicando a ética, propósito e limites do SaaS
// ============================================================================

export default function ManifestoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link 
            href="/"
            className="flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Voltar ao início</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-sm font-semibold text-purple-900">Radar Narcisista BR</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Nosso Manifesto
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            A Alma do <span className="text-purple-600">Radar Narcisista BR</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Por que existimos, pra quem somos e pra quem não somos.
          </p>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <main className="max-w-4xl mx-auto px-4 pb-20">
        
        {/* Seção 1: Por que existe */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">1. Por que o Radar existe</h2>
          </div>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <p>
              O <strong>Radar Narcisista BR</strong> nasceu de uma realidade dura:
            </p>
            <ul className="space-y-2">
              <li>Gente que vive relações confusas, desgastantes, humilhantes…</li>
              <li>Gente que escuta "você é louca(o)", "você exagera", "isso é coisa da sua cabeça".</li>
              <li>Gente que tenta explicar o que viveu e ninguém entende o tamanho da dor.</li>
            </ul>
            <p>
              Muitas pessoas duvidam da própria sanidade, não sabem se é "abuso" ou "briga normal", 
              não conseguem contar a história na ordem, com fatos, datas e impacto.
            </p>
            <p>
              O Radar foi criado para ser um lugar onde você pode:
            </p>
            <ul className="space-y-2">
              <li><strong>Registrar</strong> episódios, falas e emoções ao longo do tempo</li>
              <li><strong>Enxergar padrões</strong> de comportamento (e não só momentos soltos)</li>
              <li><strong>Ganhar clareza</strong> sobre o que está acontecendo com você</li>
              <li><strong>Chegar mais preparado(a)</strong> em terapia, advocacia, serviços de proteção</li>
            </ul>
            <p className="text-purple-700 font-medium">
              É um espaço pra organizar o que você viveu, não um tribunal.
            </p>
          </div>
        </section>

        {/* Seção 2: Nosso Lema */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Scale className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">2. Nosso lema</h2>
          </div>
          
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-8 mb-6">
            <blockquote className="text-2xl md:text-3xl font-bold text-amber-900 text-center leading-relaxed">
              "Às vezes acreditamos em um mentiroso<br/>
              e culpamos um inocente."
            </blockquote>
          </div>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <p>
              Esse lema é um dos corações do Radar Narcisista BR. Ele nos lembra que:
            </p>
            <ul className="space-y-2">
              <li>O que vemos aqui são <strong>relatos</strong>, não câmera de segurança do universo</li>
              <li>Nem toda explosão de raiva isolada é "narcisismo"</li>
              <li>Nem toda acusação é verdadeira</li>
              <li>Nem todo comportamento ruim significa um padrão de abuso</li>
              <li>E, ao mesmo tempo, <strong>abuso real existe</strong> e destrói vidas em silêncio</li>
            </ul>
            <p className="text-amber-700 font-medium">
              O Radar foi desenhado para reduzir injustiças, não para criar novas.
            </p>
          </div>
        </section>

        {/* Seção 3: Como chamar */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">3. Como o Radar deve ser chamado</h2>
          </div>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <p>
              Tecnicamente, o nome é <strong>Radar Narcisista BR</strong>.
            </p>
            <p>
              Mas, no dia a dia, a gente sabe que ele vai virar:
            </p>
            <div className="flex flex-wrap gap-3 my-6">
              <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-medium">"o Radar"</span>
              <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-medium">"meu Radar"</span>
              <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-medium">"meu diário do Radar"</span>
            </div>
            <p>
              E tudo bem. A ideia é que ele possa ser um <strong>aliado íntimo</strong>, mas responsável:
            </p>
            <blockquote className="border-l-4 border-purple-400 pl-4 italic text-purple-800">
              Um lugar onde você fala tudo o que viveu, sem que isso vire automaticamente uma condenação do outro.
            </blockquote>
          </div>
        </section>

        {/* Seção 4: Pra quem é */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">4. Pra quem o Radar foi feito</h2>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
            <h3 className="font-bold text-green-800 mb-4">O Radar foi pensado principalmente para:</h3>
            <ul className="space-y-3 text-green-900">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Pessoas que sentem que <strong>algo está muito errado</strong> na relação e não conseguem organizar a história</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Pessoas que vivem gaslighting, chantagem emocional, controle, ciúmes doentio, ameaças, humilhações, isolamento</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Pessoas que querem <strong>clareza e proteção</strong>, não vingança</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Pessoas dispostas a <strong>usar o sistema com honestidade</strong>, mesmo cheias de dor, raiva ou confusão</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <h3 className="font-bold text-blue-800 mb-4">Também pode ajudar profissionais:</h3>
            <ul className="space-y-2 text-blue-900">
              <li className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Psicólogos(as), terapeutas, psiquiatras</span>
              </li>
              <li className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-blue-600" />
                <span>Advogados(as) de família, defensoria</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Serviços sociais, ONGs e projetos de acolhimento</span>
              </li>
            </ul>
            <p className="text-sm text-blue-700 mt-4">
              Nesses casos, o Radar funciona como <strong>ferramenta complementar</strong> de organização de relatos – 
              nunca como laudo automático, prova mágica ou sentença.
            </p>
          </div>
        </section>

        {/* Seção 5: Pra quem NÃO é */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">5. Pra quem o Radar NÃO foi feito</h2>
          </div>
          
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
            <h3 className="font-bold text-red-800 mb-4">O Radar NÃO é o lugar certo para quem:</h3>
            <ul className="space-y-3 text-red-900">
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span>Quer <strong>inventar ou distorcer fatos</strong> para destruir a reputação de alguém</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span>Procura um jeito de "fabricar provas" para vencer qualquer disputa a qualquer custo</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span>Pretende usar o sistema para <strong>perseguição, difamação, chantagem ou vingança</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span>Espera um "juiz automático" que diga quem é o monstro da história</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span>Quer diagnósticos clínicos ou jurídicos prontos saindo de um botão</span>
              </li>
            </ul>
            
            <div className="mt-6 pt-6 border-t border-red-200">
              <p className="text-red-800 font-medium">
                Se sua intenção é manipular a narrativa, montar uma história que você sabe que não é honesta, 
                ou usar o Radar como arma contra alguém, então esse <strong>não é</strong> o lugar certo.
              </p>
            </div>
          </div>
        </section>

        {/* Seção 6: O que faz e não faz */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">6. O que o Radar faz (e o que ele não faz)</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
              <h3 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                O que o Radar FAZ:
              </h3>
              <ul className="space-y-3 text-green-900 text-sm">
                <li>✓ Ajuda você a <strong>registrar</strong> episódios, mensagens, falas e emoções</li>
                <li>✓ Usa IA para <strong>organizar</strong> o que você relatou</li>
                <li>✓ Ajuda a enxergar possíveis <strong>padrões de comportamento</strong></li>
                <li>✓ Te lembra que você é a pessoa <strong>dona da sua história</strong></li>
                <li>✓ Incentiva buscar <strong>profissionais humanos</strong></li>
              </ul>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                O que o Radar NÃO FAZ:
              </h3>
              <ul className="space-y-3 text-gray-700 text-sm">
                <li>✗ Não decide quem é culpado ou inocente</li>
                <li>✗ Não faz diagnóstico clínico ou psiquiátrico</li>
                <li>✗ Não dá parecer jurídico nem garante resultado em processo</li>
                <li>✗ Não detecta mentiras – não é polígrafo</li>
                <li>✗ Não transforma relato em "prova" automática</li>
              </ul>
            </div>
          </div>
          
          <p className="text-center text-purple-700 font-medium mt-6">
            Ele é um <strong>espelho organizado</strong>, não um martelo de juiz.
          </p>
        </section>

        {/* Seção 7: Humildade sobre a verdade */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Eye className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">7. Humildade sobre a verdade</h2>
          </div>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <p>
              O Radar e suas IAs (como o <strong>Coach de Clareza</strong>) trabalham com um princípio firme:
            </p>
            <blockquote className="border-l-4 border-indigo-400 pl-4 italic text-indigo-800 bg-indigo-50 py-4 pr-4 rounded-r-xl">
              "Eu estou vendo o que <strong>você</strong> me conta, na sua perspectiva, no seu tempo."
            </blockquote>
            <p>
              Por isso, sempre que o Coach comenta algo, ele usa expressões como:
            </p>
            <ul className="space-y-2">
              <li>"pelo que você está relatando…"</li>
              <li>"na sua perspectiva…"</li>
              <li>"com base na forma como você descreveu os fatos…"</li>
            </ul>
            <p>
              Nos bastidores, existe um cuidado constante para que a tecnologia <strong>não vire máquina de carimbo</strong>:
            </p>
            <ul className="space-y-2">
              <li>Nem carimbar "você é louco(a)"</li>
              <li>Nem carimbar "o outro é um monstro" com base num único episódio</li>
            </ul>
          </div>
        </section>

        {/* Seção 8: Episódio isolado vs padrão */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">8. Episódio isolado vs. padrão abusivo</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
              <h3 className="font-bold text-yellow-800 mb-3">Episódio isolado</h3>
              <ul className="space-y-2 text-yellow-900 text-sm">
                <li>• Uma explosão num dia péssimo</li>
                <li>• Um comentário injusto</li>
                <li>• Um erro pontual que pode ter contexto</li>
                <li>• Estresse, cansaço, momento difícil</li>
              </ul>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <h3 className="font-bold text-red-800 mb-3">Padrão repetido e assimétrico</h3>
              <ul className="space-y-2 text-red-900 text-sm">
                <li>• Controle constante</li>
                <li>• Humilhações recorrentes</li>
                <li>• Inversão de culpa sistemática</li>
                <li>• Medo crônico, isolamento</li>
                <li>• Ciclos de prometer e quebrar</li>
              </ul>
            </div>
          </div>
          
          <p className="text-gray-700">
            O Radar foi feito para ajudar você a enxergar se está lidando com só um relacionamento com conflitos comuns 
            (mesmo que dolorosos), ou com algo que se parece mais com um <strong>padrão de abuso emocional/psicológico</strong>.
          </p>
          <p className="text-purple-700 font-medium mt-4">
            Sem diagnóstico, sem rótulo clínico, mas com clareza.
          </p>
        </section>

        {/* Seção 9: Como usar */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">9. Como queremos que você use o Radar</h2>
          </div>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <p>Queremos que você use o Radar para:</p>
            <ul className="space-y-2">
              <li><strong>Se ouvir</strong> com honestidade</li>
              <li><strong>Organizar</strong> sua história e suas emoções</li>
              <li><strong>Se proteger</strong> melhor, com mais clareza</li>
              <li><strong>Chegar mais preparado(a)</strong> para conversar com profissionais</li>
            </ul>
            <p>
              E queremos que você use sabendo que o Radar não vê tudo, não conhece o outro lado, 
              não tem como saber 100% o que aconteceu.
            </p>
            <p>Por isso, o próprio sistema te incentiva a:</p>
            <ul className="space-y-2">
              <li>Buscar apoio psicológico quando possível</li>
              <li>Procurar orientação jurídica quando necessário</li>
              <li>Recorrer a canais oficiais em caso de risco (delegacias, serviços de proteção, linhas de apoio)</li>
            </ul>
          </div>
        </section>

        {/* Seção 10: Nosso compromisso */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">10. Nosso compromisso com você</h2>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-8">
            <p className="text-lg text-gray-700 mb-6">
              O compromisso do Radar Narcisista BR é com:
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 bg-white/60 rounded-xl p-4">
                <Heart className="w-6 h-6 text-purple-600" />
                <span className="font-medium text-gray-800">A sua clareza</span>
              </div>
              <div className="flex items-center gap-3 bg-white/60 rounded-xl p-4">
                <Shield className="w-6 h-6 text-purple-600" />
                <span className="font-medium text-gray-800">A sua segurança</span>
              </div>
              <div className="flex items-center gap-3 bg-white/60 rounded-xl p-4">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <span className="font-medium text-gray-800">A sua dignidade</span>
              </div>
              <div className="flex items-center gap-3 bg-white/60 rounded-xl p-4">
                <Scale className="w-6 h-6 text-purple-600" />
                <span className="font-medium text-gray-800">Responsabilidade no uso da tecnologia</span>
              </div>
            </div>
            
            <div className="border-t border-purple-200 pt-6">
              <p className="text-gray-700 mb-4">
                Nós <strong>não queremos</strong> chamar você de mentiroso(a), nem transformar sua dor em espetáculo.
              </p>
              <p className="text-gray-700 mb-4">
                Mas também <strong>não queremos</strong> carimbar outra pessoa como "monstro" ou "narcisista" 
                com base em uma única mensagem, nem participar de fraude, vingança ou fabricação de histórias.
              </p>
            </div>
          </div>
        </section>

        {/* Conclusão */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              O Radar Narcisista BR quer ser, na prática:
            </h2>
            <blockquote className="text-xl md:text-2xl font-medium mb-8 opacity-95">
              "O seu Radar de padrões,<br/>
              não o juiz da vida de ninguém."
            </blockquote>
            <p className="text-purple-100 max-w-2xl mx-auto">
              Ele está aqui para te ajudar a enxergar melhor o que você viveu e tomar decisões mais conscientes e seguras, 
              sempre lembrando que, em conflitos humanos, a verdade é complexa – 
              e por isso escolhemos a <strong className="text-white">humildade</strong> em vez da certeza absoluta.
            </p>
            
            <div className="mt-10">
              <Link 
                href="/cadastro"
                className="inline-flex items-center gap-2 bg-white text-purple-700 px-8 py-4 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
              >
                Começar a usar o Radar
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center text-sm">
          <p className="mb-2">
            © {new Date().getFullYear()} Radar Narcisista BR. Todos os direitos reservados.
          </p>
          <p>
            Este manifesto reflete nossos valores e compromissos. 
            <Link href="/termos" className="text-purple-400 hover:text-purple-300 ml-1">
              Termos de Uso
            </Link>
            {' | '}
            <Link href="/privacidade" className="text-purple-400 hover:text-purple-300">
              Privacidade
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
