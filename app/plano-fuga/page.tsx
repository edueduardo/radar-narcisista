'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Shield, Lock, CheckCircle, Circle, AlertTriangle, Phone, FileText, DollarSign, Users, MapPin, Briefcase } from 'lucide-react'

interface ChecklistItem {
  id: string
  texto: string
  descricao: string
  icone: React.ReactNode
  concluido: boolean
}

const checklistInicial: ChecklistItem[] = [
  {
    id: 'documentos',
    texto: 'Documentos guardados em lugar seguro',
    descricao: 'RG, CPF, certidões, passaporte, documentos dos filhos',
    icone: <FileText className="w-5 h-5" />,
    concluido: false,
  },
  {
    id: 'dinheiro',
    texto: 'Dinheiro de emergência separado',
    descricao: 'Valor suficiente para pelo menos 1 mês de despesas básicas',
    icone: <DollarSign className="w-5 h-5" />,
    concluido: false,
  },
  {
    id: 'pessoa',
    texto: 'Pessoa de confiança avisada',
    descricao: 'Alguém que sabe da situação e pode ajudar se necessário',
    icone: <Users className="w-5 h-5" />,
    concluido: false,
  },
  {
    id: 'lugar',
    texto: 'Lugar para ir definido',
    descricao: 'Casa de familiar, amigo, ou abrigo identificado',
    icone: <MapPin className="w-5 h-5" />,
    concluido: false,
  },
  {
    id: 'mala',
    texto: 'Mala de emergência pronta',
    descricao: 'Roupas essenciais, remédios, itens de higiene',
    icone: <Briefcase className="w-5 h-5" />,
    concluido: false,
  },
  {
    id: 'telefones',
    texto: 'Telefones de emergência memorizados',
    descricao: '190, 188, delegacia, pessoa de confiança',
    icone: <Phone className="w-5 h-5" />,
    concluido: false,
  },
  {
    id: 'conta',
    texto: 'Conta bancária própria',
    descricao: 'Conta em seu nome que só você tem acesso',
    icone: <DollarSign className="w-5 h-5" />,
    concluido: false,
  },
  {
    id: 'codigo',
    texto: 'Código de emergência combinado',
    descricao: 'Palavra ou frase que significa "preciso de ajuda" para pessoas de confiança',
    icone: <Shield className="w-5 h-5" />,
    concluido: false,
  },
]

export default function PlanoFugaPage() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(checklistInicial)
  const [notas, setNotas] = useState('')

  // Carregar do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('plano-fuga')
    if (saved) {
      const data = JSON.parse(saved)
      setChecklist(data.checklist || checklistInicial)
      setNotas(data.notas || '')
    }
  }, [])

  // Salvar no localStorage
  useEffect(() => {
    localStorage.setItem('plano-fuga', JSON.stringify({ checklist, notas }))
  }, [checklist, notas])

  const toggleItem = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, concluido: !item.concluido } : item
    ))
  }

  const progresso = Math.round((checklist.filter(i => i.concluido).length / checklist.length) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </Link>
        </div>

        {/* Aviso de Segurança */}
        <div className="bg-red-900/50 border border-red-500/50 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold text-red-300 mb-2">Aviso de Segurança</h2>
              <p className="text-red-200 text-sm">
                Esta página é <strong>privada e criptografada</strong>. Os dados ficam apenas no seu dispositivo.
                Se você está em perigo imediato, ligue <strong>190</strong>.
                <br /><br />
                <strong>Dica:</strong> Acesse esta página em modo anônimo/privado do navegador para não deixar rastros no histórico.
              </p>
            </div>
          </div>
        </div>

        {/* Título */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-purple-600/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Plano de Segurança
          </h1>
          <p className="text-lg text-gray-400">
            Checklist privado para quando você decidir sair
          </p>
        </div>

        {/* Barra de Progresso */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-300 font-medium">Seu progresso</span>
            <span className="text-purple-400 font-bold">{progresso}%</span>
          </div>
          <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500"
              style={{ width: `${progresso}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {checklist.filter(i => i.concluido).length} de {checklist.length} itens concluídos
          </p>
        </div>

        {/* Checklist */}
        <div className="space-y-4 mb-8">
          {checklist.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`bg-gray-800 rounded-2xl p-5 cursor-pointer transition-all border-2 ${
                item.concluido 
                  ? 'border-green-500/50 bg-green-900/20' 
                  : 'border-gray-700 hover:border-purple-500/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  item.concluido ? 'bg-green-500' : 'bg-gray-700'
                }`}>
                  {item.concluido ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={item.concluido ? 'text-green-400' : 'text-gray-400'}>
                      {item.icone}
                    </span>
                    <h3 className={`font-semibold ${item.concluido ? 'text-green-300 line-through' : 'text-white'}`}>
                      {item.texto}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500">{item.descricao}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Notas Privadas */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-white">Notas Privadas</h3>
          </div>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Anote informações importantes aqui: endereços, telefones, senhas de contas, etc. Tudo fica salvo apenas no seu dispositivo."
            className="w-full h-32 bg-gray-900 border border-gray-700 rounded-xl p-4 text-gray-300 placeholder-gray-600 focus:border-purple-500 focus:outline-none resize-none"
          />
          <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
            <Lock className="w-3 h-3" /> Dados salvos localmente, não enviados para nenhum servidor
          </p>
        </div>

        {/* Números de Emergência */}
        <div className="bg-red-900/30 border border-red-500/30 rounded-2xl p-6 mb-8">
          <h3 className="font-bold text-red-300 mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Números de Emergência
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <a href="tel:190" className="bg-red-800/50 rounded-xl p-4 text-center hover:bg-red-800 transition-colors">
              <p className="text-3xl font-bold text-white">190</p>
              <p className="text-red-200 text-sm">Polícia</p>
            </a>
            <a href="tel:188" className="bg-purple-800/50 rounded-xl p-4 text-center hover:bg-purple-800 transition-colors">
              <p className="text-3xl font-bold text-white">188</p>
              <p className="text-purple-200 text-sm">CVV - Apoio</p>
            </a>
            <a href="tel:100" className="bg-blue-800/50 rounded-xl p-4 text-center hover:bg-blue-800 transition-colors">
              <p className="text-3xl font-bold text-white">100</p>
              <p className="text-blue-200 text-sm">Direitos Humanos</p>
            </a>
            <a href="tel:181" className="bg-green-800/50 rounded-xl p-4 text-center hover:bg-green-800 transition-colors">
              <p className="text-3xl font-bold text-white">181</p>
              <p className="text-green-200 text-sm">Disque Denúncia</p>
            </a>
          </div>
        </div>

        {/* Mensagem Final */}
        <div className="text-center">
          <p className="text-gray-400 mb-4">
            Você está fazendo a coisa certa ao se preparar. 
            <br />
            <strong className="text-white">Sua segurança é prioridade.</strong>
          </p>
          <Link
            href="/seguranca"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            Ver recursos de ajuda por estado →
          </Link>
        </div>
      </div>
    </div>
  )
}
