import PlaceholderPage from '@/components/PlaceholderPage'

export default function EquipePage() {
  return (
    <PlaceholderPage
      title="Equipe Interna"
      description="Gerencie a equipe interna do Radar Narcisista."
      icon="👷"
      features={[
        'Adicionar membros da equipe',
        'Definir permissões e papéis',
        'Gerenciar acessos ao admin',
        'Histórico de ações por membro',
        'Configurar notificações por equipe'
      ]}
    />
  )
}
