'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, X, MapPin } from 'lucide-react'

// Nomes brasileiros - 70% femininos, 30% masculinos
const nomesFemininos = [
  'Maria', 'Ana', 'Juliana', 'Fernanda', 'Camila', 'Patrícia', 'Aline', 'Bruna',
  'Carla', 'Daniela', 'Eduarda', 'Fabiana', 'Gabriela', 'Helena', 'Isabela',
  'Jéssica', 'Karina', 'Larissa', 'Mariana', 'Natália', 'Paula', 'Rafaela',
  'Sabrina', 'Tatiana', 'Vanessa', 'Amanda', 'Beatriz', 'Carolina', 'Débora',
  'Elaine', 'Flávia', 'Giovana', 'Heloísa', 'Ingrid', 'Joana', 'Kelly',
  'Letícia', 'Michele', 'Nathalia', 'Priscila', 'Renata', 'Simone', 'Thais',
  'Viviane', 'Yasmin', 'Adriana', 'Bianca', 'Cláudia', 'Diana', 'Elisa'
]

const nomesMasculinos = [
  'João', 'Pedro', 'Lucas', 'Gabriel', 'Rafael', 'Matheus', 'Bruno', 'Felipe',
  'Gustavo', 'Henrique', 'Igor', 'José', 'Leonardo', 'Marcos', 'Nicolas',
  'Paulo', 'Ricardo', 'Thiago', 'Vinícius', 'André', 'Carlos', 'Diego',
  'Eduardo', 'Fernando', 'Guilherme', 'Hugo', 'Ivan', 'Jorge', 'Leandro'
]

const estadosBrasil = [
  'SP', 'RJ', 'MG', 'BA', 'PR', 'RS', 'PE', 'CE', 'PA', 'SC',
  'MA', 'GO', 'AM', 'PB', 'ES', 'RN', 'AL', 'PI', 'MT', 'DF',
  'MS', 'SE', 'RO', 'TO', 'AC', 'AP', 'RR'
]

// Estados vizinhos para mostrar pessoas "próximas"
const estadosVizinhos: Record<string, string[]> = {
  'SP': ['SP', 'RJ', 'MG', 'PR', 'MS'],
  'RJ': ['RJ', 'SP', 'MG', 'ES'],
  'MG': ['MG', 'SP', 'RJ', 'ES', 'BA', 'GO', 'DF'],
  'BA': ['BA', 'SE', 'AL', 'PE', 'PI', 'MG', 'ES', 'GO'],
  'PR': ['PR', 'SP', 'SC', 'MS'],
  'RS': ['RS', 'SC', 'PR'],
  'PE': ['PE', 'PB', 'AL', 'BA', 'PI', 'CE'],
  'CE': ['CE', 'PI', 'PE', 'PB', 'RN'],
  'PA': ['PA', 'AM', 'MA', 'TO', 'AP'],
  'SC': ['SC', 'PR', 'RS'],
  'GO': ['GO', 'DF', 'MG', 'BA', 'TO', 'MT', 'MS'],
  'DF': ['DF', 'GO', 'MG'],
  'AM': ['AM', 'PA', 'RO', 'AC', 'RR'],
  'MA': ['MA', 'PI', 'PA', 'TO'],
  'default': estadosBrasil
}

const acoes = [
  'acabou de fazer o teste',
  'completou o Teste de Clareza',
  'descobriu seu resultado',
  'fez o teste agora',
  'acabou de se cadastrar',
  'iniciou sua jornada'
]

// Gerar pessoa aleatória (70% mulher, 30% homem)
const gerarPessoa = (estadoUsuario?: string) => {
  const isFeminino = Math.random() < 0.7
  const nomes = isFeminino ? nomesFemininos : nomesMasculinos
  const nome = nomes[Math.floor(Math.random() * nomes.length)]
  
  // Se temos o estado do usuário, 60% chance de mostrar alguém do mesmo estado ou vizinho
  let estado: string
  if (estadoUsuario && Math.random() < 0.6) {
    const vizinhos = estadosVizinhos[estadoUsuario] || estadosVizinhos['default']
    estado = vizinhos[Math.floor(Math.random() * vizinhos.length)]
  } else {
    estado = estadosBrasil[Math.floor(Math.random() * estadosBrasil.length)]
  }
  
  const acao = acoes[Math.floor(Math.random() * acoes.length)]
  const tempoAtras = Math.floor(Math.random() * 5) + 1 // 1-5 minutos
  
  return {
    nome: nome.charAt(0).toUpperCase() + '.', // Só inicial: "M."
    estado,
    acao,
    tempoAtras,
    genero: isFeminino ? 'f' : 'm',
    isLocal: estado === estadoUsuario
  }
}

export default function SocialProofWidget() {
  const [visible, setVisible] = useState(false)
  const [pessoa, setPessoa] = useState(gerarPessoa())
  const [dismissed, setDismissed] = useState(false)
  const [userEstado, setUserEstado] = useState<string | undefined>(undefined)
  const [userCidade, setUserCidade] = useState<string | undefined>(undefined)

  // Detectar localização do usuário via IP (não precisa de permissão)
  useEffect(() => {
    const detectarLocalizacao = async () => {
      try {
        // Usar API gratuita para detectar localização por IP
        const response = await fetch('https://ipapi.co/json/')
        const data = await response.json()
        
        if (data.country_code === 'BR' && data.region_code) {
          setUserEstado(data.region_code)
          setUserCidade(data.city)
          console.log(`📍 Localização detectada: ${data.city}, ${data.region_code}`)
        }
      } catch (error) {
        console.log('Não foi possível detectar localização, usando aleatório')
      }
    }
    
    detectarLocalizacao()
  }, [])

  useEffect(() => {
    // Não mostrar se usuário já dispensou
    if (dismissed) return

    // Mostrar após 5 segundos
    const showTimer = setTimeout(() => {
      setPessoa(gerarPessoa(userEstado))
      setVisible(true)
    }, 5000)

    return () => clearTimeout(showTimer)
  }, [dismissed, userEstado])

  useEffect(() => {
    if (!visible) return

    // Esconder após 5 segundos
    const hideTimer = setTimeout(() => {
      setVisible(false)
      
      // Mostrar próxima notificação após 15-30 segundos
      const nextTimer = setTimeout(() => {
        if (!dismissed) {
          setPessoa(gerarPessoa(userEstado))
          setVisible(true)
        }
      }, Math.random() * 15000 + 15000)

      return () => clearTimeout(nextTimer)
    }, 5000)

    return () => clearTimeout(hideTimer)
  }, [visible, dismissed, userEstado])

  if (!visible || dismissed) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-slide-in-left">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-4 max-w-xs flex items-start gap-3 relative">
        {/* Botão fechar */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ícone */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 pr-4">
          <p className="text-sm text-gray-800 font-medium">
            <span className="text-purple-600 font-bold">{pessoa.nome}</span>
            {' '}de{' '}
            <span className={`font-semibold ${pessoa.isLocal ? 'text-green-600' : ''}`}>
              {pessoa.estado}
              {pessoa.isLocal && ' 📍'}
            </span>
            {' '}{pessoa.acao}
          </p>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            {pessoa.isLocal && <MapPin className="w-3 h-3 text-green-500" />}
            {pessoa.isLocal ? 'Perto de você • ' : ''}
            há {pessoa.tempoAtras} {pessoa.tempoAtras === 1 ? 'minuto' : 'minutos'}
          </p>
        </div>

        {/* Badge de verificado ou local */}
        <div className={`absolute -top-2 -right-2 text-white text-xs px-2 py-0.5 rounded-full font-medium ${
          pessoa.isLocal ? 'bg-green-500' : 'bg-purple-500'
        }`}>
          {pessoa.isLocal ? '📍 Sua região' : '✓ Verificado'}
        </div>
      </div>

      {/* Animação CSS */}
      <style jsx>{`
        @keyframes slide-in-left {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
