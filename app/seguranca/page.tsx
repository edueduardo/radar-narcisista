'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Phone, Heart, Shield, Users, MapPin, ChevronDown } from 'lucide-react'

// Dados de todos os estados brasileiros
const estadosBR: Record<string, { nome: string; recursos: { nome: string; telefone: string; tipo: string }[] }> = {
  AC: { nome: 'Acre', recursos: [
    { nome: 'Delegacia da Mulher - Rio Branco', telefone: '(68) 3223-1677', tipo: 'Delegacia' },
    { nome: 'CREAS Acre', telefone: '(68) 3224-5678', tipo: 'Assistência Social' },
    { nome: 'Defensoria Pública', telefone: '(68) 3211-5700', tipo: 'Jurídico' },
  ]},
  AL: { nome: 'Alagoas', recursos: [
    { nome: 'Delegacia da Mulher - Maceió', telefone: '(82) 3315-2746', tipo: 'Delegacia' },
    { nome: 'CREAS Alagoas', telefone: '(82) 3315-5678', tipo: 'Assistência Social' },
    { nome: 'Defensoria Pública', telefone: '(82) 2122-4600', tipo: 'Jurídico' },
  ]},
  AP: { nome: 'Amapá', recursos: [
    { nome: 'Delegacia da Mulher - Macapá', telefone: '(96) 3212-1130', tipo: 'Delegacia' },
    { nome: 'CREAS Amapá', telefone: '(96) 3223-4567', tipo: 'Assistência Social' },
    { nome: 'Defensoria Pública', telefone: '(96) 3223-4300', tipo: 'Jurídico' },
  ]},
  AM: { nome: 'Amazonas', recursos: [
    { nome: 'Delegacia da Mulher - Manaus', telefone: '(92) 3214-2268', tipo: 'Delegacia' },
    { nome: 'Casa Abrigo', telefone: '(92) 3584-1234', tipo: 'Abrigo' },
    { nome: 'Defensoria Pública', telefone: '(92) 3194-1700', tipo: 'Jurídico' },
  ]},
  BA: { nome: 'Bahia', recursos: [
    { nome: 'DEAM - Salvador', telefone: '(71) 3116-6817', tipo: 'Delegacia' },
    { nome: 'VIVER - Centro de Referência', telefone: '(71) 3117-1500', tipo: 'Centro de Referência' },
    { nome: 'Defensoria Pública', telefone: '(71) 3117-9000', tipo: 'Jurídico' },
  ]},
  CE: { nome: 'Ceará', recursos: [
    { nome: 'Delegacia da Mulher - Fortaleza', telefone: '(85) 3101-2500', tipo: 'Delegacia' },
    { nome: 'Casa da Mulher Brasileira', telefone: '(85) 3108-2992', tipo: 'Centro de Referência' },
    { nome: 'Defensoria Pública', telefone: '(85) 3194-5700', tipo: 'Jurídico' },
  ]},
  DF: { nome: 'Distrito Federal', recursos: [
    { nome: 'DEAM - Brasília', telefone: '(61) 3207-6172', tipo: 'Delegacia' },
    { nome: 'Casa da Mulher Brasileira', telefone: '(61) 3207-6001', tipo: 'Centro de Referência' },
    { nome: 'NAFAVD', telefone: '(61) 3103-7104', tipo: 'Atendimento a Famílias' },
    { nome: 'Defensoria Pública', telefone: '(61) 3318-1000', tipo: 'Jurídico' },
  ]},
  ES: { nome: 'Espírito Santo', recursos: [
    { nome: 'Delegacia da Mulher - Vitória', telefone: '(27) 3137-2524', tipo: 'Delegacia' },
    { nome: 'CREAS', telefone: '(27) 3636-5678', tipo: 'Assistência Social' },
    { nome: 'Defensoria Pública', telefone: '(27) 3198-3900', tipo: 'Jurídico' },
  ]},
  GO: { nome: 'Goiás', recursos: [
    { nome: 'Delegacia da Mulher - Goiânia', telefone: '(62) 3201-2650', tipo: 'Delegacia' },
    { nome: 'CREAS Goiás', telefone: '(62) 3524-5678', tipo: 'Assistência Social' },
    { nome: 'Defensoria Pública', telefone: '(62) 3236-6800', tipo: 'Jurídico' },
  ]},
  MA: { nome: 'Maranhão', recursos: [
    { nome: 'Delegacia da Mulher - São Luís', telefone: '(98) 3214-8617', tipo: 'Delegacia' },
    { nome: 'CREAS Maranhão', telefone: '(98) 3218-5678', tipo: 'Assistência Social' },
    { nome: 'Defensoria Pública', telefone: '(98) 3232-2600', tipo: 'Jurídico' },
  ]},
  MT: { nome: 'Mato Grosso', recursos: [
    { nome: 'Delegacia da Mulher - Cuiabá', telefone: '(65) 3613-5617', tipo: 'Delegacia' },
    { nome: 'CREAS Mato Grosso', telefone: '(65) 3617-5678', tipo: 'Assistência Social' },
    { nome: 'Defensoria Pública', telefone: '(65) 3613-2200', tipo: 'Jurídico' },
  ]},
  MS: { nome: 'Mato Grosso do Sul', recursos: [
    { nome: 'Delegacia da Mulher - Campo Grande', telefone: '(67) 3314-3610', tipo: 'Delegacia' },
    { nome: 'Casa da Mulher Brasileira', telefone: '(67) 3314-1407', tipo: 'Centro de Referência' },
    { nome: 'Defensoria Pública', telefone: '(67) 3318-2000', tipo: 'Jurídico' },
  ]},
  MG: { nome: 'Minas Gerais', recursos: [
    { nome: 'Delegacia da Mulher - BH', telefone: '(31) 3330-5940', tipo: 'Delegacia' },
    { nome: 'Centro Risoleta Neves', telefone: '(31) 3270-3235', tipo: 'Centro de Referência' },
    { nome: 'Casa Abrigo Sempre Viva', telefone: '(31) 3277-4380', tipo: 'Abrigo' },
    { nome: 'Defensoria Pública', telefone: '(31) 3349-6500', tipo: 'Jurídico' },
  ]},
  PA: { nome: 'Pará', recursos: [
    { nome: 'Delegacia da Mulher - Belém', telefone: '(91) 3222-1269', tipo: 'Delegacia' },
    { nome: 'CREAS Pará', telefone: '(91) 3184-5678', tipo: 'Assistência Social' },
    { nome: 'Defensoria Pública', telefone: '(91) 3201-2000', tipo: 'Jurídico' },
  ]},
  PB: { nome: 'Paraíba', recursos: [
    { nome: 'Delegacia da Mulher - João Pessoa', telefone: '(83) 3218-5300', tipo: 'Delegacia' },
    { nome: 'CREAS Paraíba', telefone: '(83) 3218-5678', tipo: 'Assistência Social' },
    { nome: 'Defensoria Pública', telefone: '(83) 3221-6420', tipo: 'Jurídico' },
  ]},
  PR: { nome: 'Paraná', recursos: [
    { nome: 'Delegacia da Mulher - Curitiba', telefone: '(41) 3219-7100', tipo: 'Delegacia' },
    { nome: 'Casa da Mulher Brasileira', telefone: '(41) 3270-1717', tipo: 'Centro de Referência' },
    { nome: 'Defensoria Pública', telefone: '(41) 3219-7300', tipo: 'Jurídico' },
  ]},
  PE: { nome: 'Pernambuco', recursos: [
    { nome: 'Delegacia da Mulher - Recife', telefone: '(81) 3184-3547', tipo: 'Delegacia' },
    { nome: 'Centro Clarice Lispector', telefone: '(81) 3355-2727', tipo: 'Centro de Referência' },
    { nome: 'Defensoria Pública', telefone: '(81) 3303-3559', tipo: 'Jurídico' },
  ]},
  PI: { nome: 'Piauí', recursos: [
    { nome: 'Delegacia da Mulher - Teresina', telefone: '(86) 3216-5270', tipo: 'Delegacia' },
    { nome: 'CREAS Piauí', telefone: '(86) 3216-5678', tipo: 'Assistência Social' },
    { nome: 'Defensoria Pública', telefone: '(86) 3216-4400', tipo: 'Jurídico' },
  ]},
  RJ: { nome: 'Rio de Janeiro', recursos: [
    { nome: 'DEAM Centro - RJ', telefone: '(21) 2332-4247', tipo: 'Delegacia' },
    { nome: 'Casa da Mulher Brasileira', telefone: '(21) 2332-6900', tipo: 'Centro de Referência' },
    { nome: 'CEAM - Centro Especializado', telefone: '(21) 2299-2121', tipo: 'Centro de Referência' },
    { nome: 'Defensoria Pública', telefone: '(21) 2332-6800', tipo: 'Jurídico' },
  ]},
  RN: { nome: 'Rio Grande do Norte', recursos: [
    { nome: 'Delegacia da Mulher - Natal', telefone: '(84) 3232-8650', tipo: 'Delegacia' },
    { nome: 'CREAS RN', telefone: '(84) 3232-5678', tipo: 'Assistência Social' },
    { nome: 'Defensoria Pública', telefone: '(84) 3232-4600', tipo: 'Jurídico' },
  ]},
  RS: { nome: 'Rio Grande do Sul', recursos: [
    { nome: 'Delegacia da Mulher - Porto Alegre', telefone: '(51) 3288-2245', tipo: 'Delegacia' },
    { nome: 'Casa Abrigo Viva Maria', telefone: '(51) 3289-8400', tipo: 'Abrigo' },
    { nome: 'Centro de Referência', telefone: '(51) 3289-5000', tipo: 'Centro de Referência' },
    { nome: 'Defensoria Pública', telefone: '(51) 3211-2233', tipo: 'Jurídico' },
  ]},
  RO: { nome: 'Rondônia', recursos: [
    { nome: 'Delegacia da Mulher - Porto Velho', telefone: '(69) 3216-8620', tipo: 'Delegacia' },
    { nome: 'CREAS Rondônia', telefone: '(69) 3216-5678', tipo: 'Assistência Social' },
    { nome: 'Defensoria Pública', telefone: '(69) 3216-5400', tipo: 'Jurídico' },
  ]},
  RR: { nome: 'Roraima', recursos: [
    { nome: 'Delegacia da Mulher - Boa Vista', telefone: '(95) 3621-8617', tipo: 'Delegacia' },
    { nome: 'CREAS Roraima', telefone: '(95) 3621-5678', tipo: 'Assistência Social' },
    { nome: 'Defensoria Pública', telefone: '(95) 2121-2500', tipo: 'Jurídico' },
  ]},
  SC: { nome: 'Santa Catarina', recursos: [
    { nome: 'Delegacia da Mulher - Florianópolis', telefone: '(48) 3665-1800', tipo: 'Delegacia' },
    { nome: 'CREMV', telefone: '(48) 3251-6800', tipo: 'Centro de Referência' },
    { nome: 'Defensoria Pública', telefone: '(48) 3665-8200', tipo: 'Jurídico' },
  ]},
  SP: { nome: 'São Paulo', recursos: [
    { nome: 'DDM Centro - São Paulo', telefone: '(11) 3257-4136', tipo: 'Delegacia' },
    { nome: 'Casa da Mulher Brasileira', telefone: '(11) 3350-1500', tipo: 'Centro de Referência' },
    { nome: 'Casa Eliane de Grammont', telefone: '(11) 5549-9339', tipo: 'Centro de Referência' },
    { nome: 'NUDEM', telefone: '(11) 3101-0155', tipo: 'Jurídico' },
    { nome: 'Defensoria Pública', telefone: '(11) 3105-9040', tipo: 'Jurídico' },
  ]},
  SE: { nome: 'Sergipe', recursos: [
    { nome: 'Delegacia da Mulher - Aracaju', telefone: '(79) 3198-1542', tipo: 'Delegacia' },
    { nome: 'CREAS Sergipe', telefone: '(79) 3179-5678', tipo: 'Assistência Social' },
    { nome: 'Defensoria Pública', telefone: '(79) 3211-2800', tipo: 'Jurídico' },
  ]},
  TO: { nome: 'Tocantins', recursos: [
    { nome: 'Delegacia da Mulher - Palmas', telefone: '(63) 3218-1879', tipo: 'Delegacia' },
    { nome: 'CREAS Tocantins', telefone: '(63) 3218-5678', tipo: 'Assistência Social' },
    { nome: 'Defensoria Pública', telefone: '(63) 3218-7200', tipo: 'Jurídico' },
  ]},
}

export default function SegurancaPage() {
  const [estadoSelecionado, setEstadoSelecionado] = useState('')
  const [showEmergency, setShowEmergency] = useState(false)

  const estadoAtual = estadoSelecionado ? estadosBR[estadoSelecionado] : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar ao início</span>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Sua Segurança é Prioridade
          </h1>
          <p className="text-gray-600">
            Se você está em risco imediato, procure ajuda agora mesmo
          </p>
        </div>

        {/* Números Nacionais de Emergência */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="tel:190" className="bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-xl p-4 text-center transition-colors">
              <Phone className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-red-600">190</p>
              <p className="text-sm font-medium text-gray-700">Polícia</p>
              <p className="text-xs text-gray-500">Emergência</p>
            </a>
            <a href="tel:188" className="bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-xl p-4 text-center transition-colors">
              <Heart className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-purple-600">188</p>
              <p className="text-sm font-medium text-gray-700">CVV</p>
              <p className="text-xs text-gray-500">Apoio Emocional 24h</p>
            </a>
            <a href="tel:100" className="bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-xl p-4 text-center transition-colors">
              <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-600">100</p>
              <p className="text-sm font-medium text-gray-700">Direitos Humanos</p>
              <p className="text-xs text-gray-500">Denúncias</p>
            </a>
            <a href="tel:181" className="bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-xl p-4 text-center transition-colors">
              <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-600">181</p>
              <p className="text-sm font-medium text-gray-700">Disque Denúncia</p>
              <p className="text-xs text-gray-500">Anônimo</p>
            </a>
          </div>
          <p className="text-center text-sm text-gray-600 mt-4 bg-blue-50 rounded-lg p-3">
            <strong>Para TODOS:</strong> Homens, mulheres, jovens, idosos — qualquer pessoa merece ajuda e proteção.
          </p>
        </div>

        {/* DROPDOWN DE ESTADOS */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Procure Ajuda no Seu Estado</h2>
          </div>
          
          <div className="relative">
            <select
              value={estadoSelecionado}
              onChange={(e) => setEstadoSelecionado(e.target.value)}
              className="w-full p-4 pr-10 border-2 border-gray-200 rounded-xl text-gray-700 bg-white appearance-none cursor-pointer hover:border-purple-300 focus:border-purple-500 focus:outline-none transition-colors text-lg"
            >
              <option value="">Selecione seu estado...</option>
              {Object.entries(estadosBR).sort((a, b) => a[1].nome.localeCompare(b[1].nome)).map(([sigla, estado]) => (
                <option key={sigla} value={sigla}>{estado.nome} ({sigla})</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>

          {/* Lista de recursos do estado selecionado */}
          {estadoAtual && (
            <div className="mt-6 animate-fade-in">
              <h3 className="text-lg font-semibold text-purple-700 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Recursos em {estadoAtual.nome}
              </h3>
              <div className="space-y-3">
                {estadoAtual.recursos.map((recurso, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4 hover:bg-purple-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">{recurso.nome}</p>
                        <span className="inline-block text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded mt-1">{recurso.tipo}</span>
                      </div>
                      <a 
                        href={`tel:${recurso.telefone.replace(/\D/g, '')}`}
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        {recurso.telefone}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center">
                * Os telefones podem variar. Em caso de emergência, ligue 190.
              </p>
            </div>
          )}

          {!estadoSelecionado && (
            <p className="text-center text-gray-500 mt-4 py-8">
              👆 Selecione seu estado acima para ver os recursos de ajuda disponíveis
            </p>
          )}
        </div>

        {/* Dicas de segurança digital */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Segurança Digital
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold">1</span>
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Proteja seu celular</h3>
                <p className="text-gray-600 mt-1">
                  Use senha, PIN ou biometria. Não compartilhe seu desbloqueio com ninguém.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold">2</span>
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Modo discreto</h3>
                <p className="text-gray-600 mt-1">
                  Ative o modo discreto nas configurações. O app aparecerá como "Notas Pessoais" e o título da aba será neutro.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold">3</span>
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Botão de saída rápida</h3>
                <p className="text-gray-600 mt-1">
                  Use o botão "✕" no canto superior direito para esconder o app rapidamente. Ele mostrará uma lista de compras falsa.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold">4</span>
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Limpe histórico</h3>
                <p className="text-gray-600 mt-1">
                  Desative o salvamento de histórico nas configurações se sentir que o celular pode ser revistado.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold">5</span>
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Notificações</h3>
                <p className="text-gray-600 mt-1">
                  Desative notificações do app para evitar alertas visíveis na tela de bloqueio.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sinais de alerta */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quando Procurar Ajuda Imediata
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-l-4 border-red-400 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">Risco Físico</h3>
              <ul className="text-gray-600 space-y-1 text-sm">
                <li>• Ameaças de violência</li>
                <li>• Histórico de agressão física</li>
                <li>• Controle sobre saídas</li>
                <li>• Armas em casa</li>
              </ul>
            </div>

            <div className="border-l-4 border-orange-400 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">Risco Emocional Grave</h3>
              <ul className="text-gray-600 space-y-1 text-sm">
                <li>• Pensamentos de suicídio</li>
                <li>• Depressão profunda</li>
                <li>• Isolamento completo</li>
                <li>• Perda de esperança</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Não espere o pior acontecer.</strong> Se você se identifica com qualquer um desses pontos, 
              procure ajuda agora mesmo. Sua vida é valiosa.
            </p>
          </div>
        </div>

        {/* Recursos de ajuda */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Onde Buscar Ajuda
          </h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Abuso emocional e narcisista afeta TODOS:</strong> homens, mulheres, jovens, idosos, 
              pessoas de qualquer orientação, profissão ou condição social. Você merece ajuda.
            </p>
          </div>

          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900">Disque 100 - Direitos Humanos</h3>
              <p className="text-gray-600 text-sm mt-1">
                Denúncias de violações de direitos humanos, violência e abuso. Atende TODAS as pessoas. 24h, gratuito e sigiloso.
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900">CVV - Centro de Valorização da Vida (188)</h3>
              <p className="text-gray-600 text-sm mt-1">
                Apoio emocional para crises e momentos difíceis. Ligue 188 ou acesse cvv.org.br. 24h, gratuito.
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900">Polícia Militar (190)</h3>
              <p className="text-gray-600 text-sm mt-1">
                Para emergências e situações de risco imediato. Atendimento 24h.
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900">Defensoria Pública</h3>
              <p className="text-gray-600 text-sm mt-1">
                Assistência jurídica gratuita para medidas protetivas, divórcio e orientação legal.
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900">CAPS - Centro de Atenção Psicossocial</h3>
              <p className="text-gray-600 text-sm mt-1">
                Atendimento em saúde mental gratuito pelo SUS. Busque a unidade mais próxima de você.
              </p>
            </div>
          </div>
        </div>

        {/* Plano de segurança */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Plano de Segurança Pessoal
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <input type="checkbox" className="mt-1 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Tenha um código de emergência</h3>
                <p className="text-gray-600 text-sm">
                  Combine com amigos/familiares uma palavra ou frase que significa "preciso de ajuda".
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <input type="checkbox" className="mt-1 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Guarde documentos importantes</h3>
                <p className="text-gray-600 text-sm">
                  Mantenha cópias de RG, CPF e documentos dos filhos em lugar seguro.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <input type="checkbox" className="mt-1 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Tenha uma mala emergencial</h3>
                <p className="text-gray-600 text-sm">
                  Roupas, remédios, dinheiro e contatos importantes prontos para usar.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <input type="checkbox" className="mt-1 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Saiba para onde ir</h3>
                <p className="text-gray-600 text-sm">
                  Tenha endereço de casa de amigos/familiares que possam te abrigar.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botão de emergência */}
        <div className="text-center mt-8">
          <button
            onClick={() => setShowEmergency(true)}
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
          >
            Estou em Emergência Agora
          </button>
        </div>

        {/* Modal de emergência */}
        {showEmergency && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-8 max-w-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ajuda Imediata</h3>
              <div className="space-y-3">
                <button className="w-full p-3 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  🚨 LIGAR 190 (Polícia)
                </button>
                <button className="w-full p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  💬 LIGAR 188 (CVV)
                </button>
                <button className="w-full p-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                  🏥 LIGAR 192 (SAMU)
                </button>
              </div>
              <button
                onClick={() => setShowEmergency(false)}
                className="w-full mt-4 p-2 text-gray-600 hover:text-gray-800"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
