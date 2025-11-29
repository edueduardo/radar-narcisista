'use client'

import { useState } from 'react'


export default function ContatoPage() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    tipo_contato: 'geral',
    organizacao: '',
    cargo: '',
    assunto: '',
    mensagem: '',
    como_conheceu: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const tiposContato = [
    { value: 'geral', label: '📝 Contato Geral', desc: 'Dúvidas, sugestões ou informações gerais' },
    { value: 'marjeting', label: '📢 Marketing e Parcerias', desc: 'Propostas de parceria, marketing e divulgação' },
    { value: 'ong', label: '🤝 ONGs e Instituições', desc: 'Colaboração entre organizações e instituições' },
    { value: 'governo', label: '🏛️ Governo e Poder Público', desc: 'Parcerias governamentais e programas sociais' },
    { value: 'financeiro', label: '💰 Financeiro e Investimentos', desc: 'Propostas de investimento, doações e apoio financeiro' },
    { value: 'imprensa', label: '📰 Imprensa e Mídia', desc: 'Solicitações de entrevista e matérias jornalísticas' },
    { value: 'tecnico', label: '🔧 Suporte Técnico', desc: 'Problemas técnicos e relatórios de bugs' },
    { value: 'denuncia', label: '⚠️ Denúncia e Segurança', desc: 'Reportar problemas de segurança ou conteúdo inadequado' },
    { value: 'voluntario', label: '🙌 Trabalho Voluntário', desc: 'Quero ajudar como voluntário(a) ou colaborador(a)' },
    { value: 'internacional', label: '🌍 Expansão Internacional', desc: 'Levar Radar para outros países e idiomas' },
    { value: 'pesquisa', label: '🔬 Pesquisa e Acadêmico', desc: 'Pesquisadores, estudantes e trabalhos acadêmicos' },
    { value: 'juridico', label: '⚖️ Assuntos Jurídicos', desc: 'Advogados, assessoria jurídica e questões legais' },
    { value: 'clinico', label: '🏥 Profissionais de Saúde', desc: 'Psicólogos, terapeutas e profissionais de saúde mental' },
    { value: 'educacao', label: '📚 Educação e Treinamento', desc: 'Escolas, empresas e treinamentos sobre abuso' },
    { value: 'tecnologia', label: '💻 Tecnologia e Desenvolvimento', desc: 'Propostas de integração tecnológica e APIs' },
    { value: 'consultoria', label: '👨‍💼 Consultoria e Assessoria', desc: 'Consultores especializados em relações abusivas' }
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome.trim() || !formData.email.trim() || !formData.mensagem.trim()) {
      alert('Por favor, preencha nome, email e mensagem.')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Formatar mensagem para envio
      const emailContent = `
NOVO CONTATO - RADAR NARCISISTA
===============================

DADOS PESSOAIS:
• Nome: ${formData.nome}
• Email: ${formData.email}
• Telefone: ${formData.telefone || 'Não informado'}

DADOS PROFISSIONAIS:
• Organização/Empresa: ${formData.organizacao || 'Não informado'}
• Cargo: ${formData.cargo || 'Não informado'}

TIPO DE CONTATO: ${formData.tipo_contato.toUpperCase()}
${tiposContato.find(t => t.value === formData.tipo_contato)?.desc}

ASSUNTO: ${formData.assunto || 'Não especificado'}

COMO CONHECEU: ${formData.como_conheceu || 'Não informado'}

MENSAGEM:
${formData.mensagem}

DATA/HORA: ${new Date().toLocaleString('pt-BR')}
      `.trim()

      // Aqui você pode integrar com:
      // 1. Email service (SendGrid, Nodemailer)
      // 2. Supabase database
      // 3. Google Sheets API
      // 4. Discord/Slack webhook
      // 5. CRM (HubSpot, Pipedrive)
      
      // Por enquanto, vamos logar no console
      console.log('Contato recebido:', emailContent)
      
      alert('✅ Mensagem enviada com sucesso!\n\nResponderemos em até 48h úteis.\n\nAgradecemos seu contato!')
      
      // Resetar formulário
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        tipo_contato: 'geral',
        organizacao: '',
        cargo: '',
        assunto: '',
        mensagem: '',
        como_conheceu: ''
      })
      
    } catch (error) {
      console.error('Erro ao enviar contato:', error)
      alert('❌ Erro ao enviar mensagem. Por favor, tente novamente ou entre em contato direto.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4 pt-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Fale Conosco
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              Estamos aqui para ajudar e colaborar
            </p>
            <p className="text-sm text-gray-500">
              Pessoas, empresas, ONGs, governo e instituições - todos são bem-vindos
            </p>
          </div>

          {/* Informações importantes */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="font-semibold text-blue-900 mb-3 text-center">
              📋 Antes de enviar sua mensagem:
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <p className="font-semibold mb-1">🚨 Emergência?</p>
                <p>Se está em crise imediata, ligue 188 (CVV) ou 190 (Polícia)</p>
              </div>
              <div>
                <p className="font-semibold mb-1">⏱️ Tempo de resposta</p>
                <p>Respondemos em até 48h úteis (exceto fins de semana)</p>
              </div>
              <div>
                <p className="font-semibold mb-1">🔒 Privacidade</p>
                <p>Suas informações são protegidas e confidenciais</p>
              </div>
              <div>
                <p className="font-semibold mb-1">🌐 Idiomas</p>
                <p>Atendemos em português, inglês e espanhol</p>
              </div>
            </div>
          </div>

          {/* Formulário */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados pessoais */}
              <div className="border-b pb-6">
                <h3 className="font-semibold text-gray-900 mb-4">👤 Dados Pessoais</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome completo *
                    </label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      placeholder="Seu nome completo"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone/WhatsApp (Internacional)
                    </label>
                    <input
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => handleInputChange('telefone', e.target.value)}
                      placeholder="+55 (11) 98765-4321 ou +1 (555) 123-4567"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Aceitamos números de qualquer país com código internacional (+)
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Como conheceu o Radar Narcisista?
                    </label>
                    <select
                      value={formData.como_conheceu}
                      onChange={(e) => handleInputChange('como_conheceu', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    >
                      <option value="">Selecione...</option>
                      <option value="google">Google/Busca online</option>
                      <option value="instagram">Instagram</option>
                      <option value="facebook">Facebook</option>
                      <option value="tiktok">TikTok</option>
                      <option value="indicacao">Indicação de amigo(a)</option>
                      <option value="profissional">Profissional de saúde</option>
                      <option value="ong">ONG ou instituição</option>
                      <option value="midia">Matéria na mídia</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dados profissionais */}
              <div className="border-b pb-6">
                <h3 className="font-semibold text-gray-900 mb-4">🏢 Dados Profissionais (opcional)</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organização/Empresa
                    </label>
                    <input
                      type="text"
                      value={formData.organizacao}
                      onChange={(e) => handleInputChange('organizacao', e.target.value)}
                      placeholder="Nome da sua organização"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cargo/Função
                    </label>
                    <input
                      type="text"
                      value={formData.cargo}
                      onChange={(e) => handleInputChange('cargo', e.target.value)}
                      placeholder="Seu cargo ou função"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* Tipo de contato */}
              <div className="border-b pb-6">
                <h3 className="font-semibold text-gray-900 mb-4">📋 Tipo de Contato</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {tiposContato.map((tipo) => (
                    <label key={tipo.value} className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="tipo_contato"
                        value={tipo.value}
                        checked={formData.tipo_contato === tipo.value}
                        onChange={(e) => handleInputChange('tipo_contato', e.target.value)}
                        className="mt-1 mr-3"
                        disabled={isSubmitting}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{tipo.label}</p>
                        <p className="text-xs text-gray-500">{tipo.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Assunto e mensagem */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">✉️ Sua Mensagem</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assunto
                    </label>
                    <input
                      type="text"
                      value={formData.assunto}
                      onChange={(e) => handleInputChange('assunto', e.target.value)}
                      placeholder="Breve resumo do assunto"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mensagem *
                    </label>
                    <textarea
                      value={formData.mensagem}
                      onChange={(e) => handleInputChange('mensagem', e.target.value)}
                      placeholder="Descreva detalhadamente sua mensagem, proposta ou dúvida..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={6}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Botão de envio */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Enviando mensagem...' : '📤 Enviar Mensagem'}
                </button>
              </div>
            </form>
          </div>

          {/* Informações adicionais */}
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-center">
              📞 Outras Formas de Contato
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="font-medium text-gray-700">📧 Email</p>
                <p className="text-sm text-gray-600">contato@radarnarcisista.com</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">📱 WhatsApp</p>
                <p className="text-sm text-gray-600">(11) 98765-4321</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">🕐 Horário</p>
                <p className="text-sm text-gray-600">Seg-Sex: 9h-18h</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}
