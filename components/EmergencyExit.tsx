'use client'

import { useState } from 'react'

export default function EmergencyExit() {
  const [emergencyMode, setEmergencyMode] = useState(false)

  const handleEmergencyExit = () => {
    // LIMPAR HISTÓRICO COMPLETO antes de esconder
    try {
      // Limpar sessionStorage
      sessionStorage.clear()
      
      // Limpar localStorage
      localStorage.clear()
      
      // Limpar todos os cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      // Tentar limpar histórico do navegador
      if (window.history.length > 1) {
        // Voltar várias vezes para limpar histórico
        setTimeout(() => {
          window.history.go(-(window.history.length - 1))
        }, 100)
      }
      
      // Mudar título da aba do navegador
      document.title = 'Notícias do Dia - Portal de Notícias'
      
      // Tentar limpar histórico (não funciona sempre, mas ajuda)
      if (window.history.replaceState) {
        window.history.replaceState(null, '', '/news')
      }
      
      // Forçar limpeza de cache
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach(name => {
            caches.delete(name)
          })
        })
      }
      
    } catch (error) {
      console.error('Erro ao limpar histórico:', error)
    }
    
    setEmergencyMode(true)
  }

  const handleClosePage = () => {
    try {
      // LIMPAR ABSOLUTAMENTE TUDO antes de fechar
      sessionStorage.clear()
      localStorage.clear()
      
      // Limpar todos os cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      // Limpar cache
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach(name => {
            caches.delete(name)
          })
        })
      }
      
      // Tentar limpar histórico completamente
      if (window.history.length > 1) {
        window.history.go(-(window.history.length - 1))
      }
      
      // Forçar redirecionamento para site neutro SEM histórico
      window.location.replace('https://www.google.com')
      
      // Tentar fechar a aba/janela (backup)
      setTimeout(() => {
        window.close()
      }, 50)
      
    } catch (error) {
      // Se tudo falhar, redirecionar imediatamente
      window.location.href = 'https://www.google.com'
    }
  }

  const handleReturnFromEmergency = () => {
    const confirmReturn = confirm('⚠️ Tem certeza que deseja voltar?\n\nEsta área é privada e confidencial.')
    if (confirmReturn) {
      setEmergencyMode(false)
      document.title = 'Radar Narcisista BR - Encontre Clareza'
      if (window.history.replaceState) {
        window.history.replaceState(null, '', '/')
      }
    }
  }

  // MODO DE EMERGÊNCIA - CONTEÚDO INOCENTE
  if (emergencyMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header de emergência */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Portal de Notícias</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleReturnFromEmergency}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Voltar
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Conteúdo falso de notícias */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Últimas Notícias</h2>
            <p className="text-gray-600">Fique informado com as principais notícias do dia</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Notícia 1 */}
            <article className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm text-gray-500 mb-2">Há 2 horas</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Economia cresce 0,4% no terceiro trimestre, diz IBGE
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                O Produto Interno Bruto (PIB) do Brasil apresentou crescimento de 0,4% no terceiro trimestre 
                deste ano na comparação com os três meses anteriores, segundo dados divulgados pelo IBGE.
              </p>
            </article>

            {/* Notícia 2 */}
            <article className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm text-gray-500 mb-2">Há 4 horas</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tecnologia: Nova atualização de sistema promete mais segurança
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Empresas de tecnologia anunciam novas medidas de segurança digital para proteger usuários 
                contra ameaças cibernéticas crescentes. Especialistas recomendam atualização imediata.
              </p>
            </article>

            {/* Notícia 3 */}
            <article className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm text-gray-500 mb-2">Há 6 horas</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Saúde: Estudo revela benefícios de atividade física regular
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Pesquisa publicada em revista científica internacional mostra que 30 minutos de exercício 
                diário podem reduzir risco de doenças crônicas em até 40%.
              </p>
            </article>

            {/* Notícia 4 */}
            <article className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm text-gray-500 mb-2">Há 8 horas</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Educação: Governo anuncia novo programa de bolsas de estudo
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Ministério da Educação lança programa que beneficiará mais de 100 mil estudantes com 
                bolsas integrais em universidades públicas e privadas de todo o país.
              </p>
            </article>

            {/* Notícia 5 */}
            <article className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm text-gray-500 mb-2">Há 10 horas</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Meio Ambiente: Brasil atinge meta de reflorestamento este ano
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Dados oficiais mostram que país ultrapassou meta de plantio de árvores com mais de 
                1 milhão de hectares reflorestados em 2024, o maior número dos últimos 10 anos.
              </p>
            </article>

            {/* Notícia 6 */}
            <article className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm text-gray-500 mb-2">Há 12 horas</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Cultura: Festival de cinema nacional recebe recorde de inscrições
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Maior festival de cinema do Brasil recebeu mais de 3 mil inscrições este ano, 
                mostrando crescimento da produção audiovisual nacional nas últimas décadas.
              </p>
            </article>
          </div>

          {/* Rodapé falso */}
          <footer className="mt-12 border-t border-gray-200 pt-8">
            <div className="text-center text-sm text-gray-500">
              <p>&copy; 2024 Portal de Notícias. Todos os direitos reservados.</p>
              <p className="mt-2">Contato: redacao@portalnoticias.com.br</p>
            </div>
          </footer>
        </main>
      </div>
    )
  }

  // BARRA DE EMERGÊNCIA FIXA (aparece em todas as páginas)
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-2 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">🛡️ Segurança Rápida:</span>
            <button
              onClick={handleEmergencyExit}
              className="bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded text-sm font-medium animate-pulse"
              title="Use se alguém está approaching - esconde o site rapidamente"
            >
              🚨 Sair Rápido
            </button>
            <button
              onClick={handleClosePage}
              className="bg-red-800 hover:bg-red-900 text-white px-3 py-1 rounded text-sm font-medium"
              title="USE SE O DISPOSITIVO PODE SER VASCULHADO - limpa tudo e sai"
            >
              ❌ Fechar Página
            </button>
          </div>
          <div className="text-xs">
            Use se alguém approaching ou dispositivo pode ser vasculhado
          </div>
        </div>
      </div>
    </div>
  )
}
