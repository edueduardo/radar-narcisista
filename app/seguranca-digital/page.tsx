'use client'

import Link from 'next/link'
import { 
  ArrowLeft, 
  Shield, 
  Eye, 
  Trash2, 
  Smartphone, 
  Globe, 
  Lock,
  AlertTriangle,
  CheckCircle,
  ExternalLink
} from 'lucide-react'
import CamouflageModeSettings from '@/components/CamouflageMode'

export default function SegurancaDigitalPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Segurança Digital
              </h1>
              <p className="text-gray-600">
                Proteja sua privacidade ao usar o Radar
              </p>
            </div>
          </div>
        </div>

        {/* Alerta importante */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-700 mb-1">
                Sua segurança é prioridade
              </h3>
              <p className="text-sm text-red-600">
                Se você está em uma situação de abuso, a pessoa abusadora pode monitorar 
                seu celular ou computador. Siga estas orientações para se proteger.
              </p>
            </div>
          </div>
        </div>

        {/* Modo Camuflagem */}
        <div className="mb-6">
          <CamouflageModeSettings />
        </div>

        {/* Seções de orientação */}
        <div className="space-y-6">
          
          {/* Navegação Privada */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="font-semibold text-gray-900">
                Use Navegação Privada
              </h2>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              A navegação privada não salva histórico, cookies ou dados de formulário.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">Chrome / Edge</p>
                  <p className="text-xs text-gray-500">
                    Pressione <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">Ctrl + Shift + N</kbd> (Windows) ou <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">⌘ + Shift + N</kbd> (Mac)
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">Firefox</p>
                  <p className="text-xs text-gray-500">
                    Pressione <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">Ctrl + Shift + P</kbd> (Windows) ou <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">⌘ + Shift + P</kbd> (Mac)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">Safari (iPhone/Mac)</p>
                  <p className="text-xs text-gray-500">
                    Toque no ícone de abas → "Privado" (iPhone) ou <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">⌘ + Shift + N</kbd> (Mac)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Limpar Histórico */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="font-semibold text-gray-900">
                Limpe o Histórico Regularmente
              </h2>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Se não usou navegação privada, limpe o histórico após cada sessão.
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="font-medium text-gray-900 text-sm mb-1">O que limpar:</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Histórico de navegação</li>
                  <li>• Cookies e dados de sites</li>
                  <li>• Dados de formulários preenchidos</li>
                  <li>• Senhas salvas (se houver)</li>
                </ul>
              </div>
              
              <div className="p-3 bg-yellow-50 rounded-xl">
                <p className="text-xs text-yellow-700">
                  💡 <strong>Dica:</strong> Configure para limpar automaticamente ao fechar o navegador 
                  (Configurações → Privacidade → Limpar ao sair)
                </p>
              </div>
            </div>
          </div>

          {/* Celular */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="font-semibold text-gray-900">
                Segurança no Celular
              </h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <Lock className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">Use senha/biometria</p>
                  <p className="text-xs text-gray-500">
                    Proteja seu celular com PIN, senha ou impressão digital
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <Eye className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">Desative pré-visualização</p>
                  <p className="text-xs text-gray-500">
                    Nas configurações de notificações, oculte o conteúdo na tela bloqueada
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <Globe className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">Acesse pelo navegador</p>
                  <p className="text-xs text-gray-500">
                    Não instale como app se o abusador verifica seus aplicativos
                  </p>
                </div>
              </div>

              <div className="p-3 bg-red-50 rounded-xl">
                <p className="text-xs text-red-700">
                  ⚠️ <strong>Atenção:</strong> Verifique se há apps de monitoramento instalados 
                  (como "Find My", "Life360", ou apps desconhecidos). Se suspeitar, use outro dispositivo.
                </p>
              </div>
            </div>
          </div>

          {/* Saída Rápida */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="font-semibold text-gray-900">
                Saída Rápida
              </h2>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-purple-50 rounded-xl">
                <p className="font-medium text-purple-700 text-sm mb-2">
                  O Radar tem botão de emergência!
                </p>
                <ul className="text-xs text-purple-600 space-y-1">
                  <li>• <strong>Computador:</strong> Pressione <kbd className="px-1.5 py-0.5 bg-purple-200 rounded">ESC</kbd> para sair instantaneamente</li>
                  <li>• <strong>Celular:</strong> Toque no botão vermelho no canto da tela</li>
                  <li>• Você será redirecionado para o Google automaticamente</li>
                </ul>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500">
                  💡 <strong>Dica extra:</strong> Tenha sempre uma "desculpa" pronta caso alguém pergunte 
                  o que você estava fazendo (ex: "pesquisando receitas", "lendo notícias")
                </p>
              </div>
            </div>
          </div>

          {/* Recursos externos */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4">
              Recursos de Ajuda
            </h2>

            <div className="space-y-3">
              <a 
                href="tel:180" 
                className="flex items-center justify-between p-4 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors"
              >
                <div>
                  <p className="font-medium text-pink-700">Central de Atendimento à Mulher</p>
                  <p className="text-sm text-pink-600">Ligue 180 - 24h, gratuito</p>
                </div>
                <ExternalLink className="w-5 h-5 text-pink-500" />
              </a>

              <a 
                href="tel:188" 
                className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors"
              >
                <div>
                  <p className="font-medium text-yellow-700">CVV - Centro de Valorização da Vida</p>
                  <p className="text-sm text-yellow-600">Ligue 188 - 24h, gratuito</p>
                </div>
                <ExternalLink className="w-5 h-5 text-yellow-500" />
              </a>

              <a 
                href="tel:190" 
                className="flex items-center justify-between p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
              >
                <div>
                  <p className="font-medium text-red-700">Polícia Militar</p>
                  <p className="text-sm text-red-600">Ligue 190 - Emergência</p>
                </div>
                <ExternalLink className="w-5 h-5 text-red-500" />
              </a>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Sua segurança é nossa prioridade. Este conteúdo não fica salvo no histórico se você usar navegação privada.</p>
        </div>
      </div>
    </div>
  )
}
