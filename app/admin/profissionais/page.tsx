import PlaceholderPage from '@/components/PlaceholderPage'

export default function ProfissionaisPage() {
  return (
    <PlaceholderPage
      title="Profissionais"
      description="Gerencie psicólogos, advogados e outros profissionais cadastrados na plataforma."
      icon="👔"
      features={[
        'Ver lista de profissionais cadastrados',
        'Aprovar ou rejeitar cadastros',
        'Vincular profissionais a clientes',
        'Gerenciar especialidades e áreas de atuação',
        'Acompanhar métricas de atendimento'
      ]}
    />
  )
}
