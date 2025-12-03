import PlaceholderPage from '@/components/PlaceholderPage'

export default function SegurancaAdminPage() {
  return (
    <PlaceholderPage
      title="Plano de Segurança"
      description="Configure templates e recursos de segurança para usuárias."
      icon="🛡️"
      features={[
        'Criar templates de plano de segurança',
        'Configurar contatos de emergência padrão',
        'Definir recursos por região',
        'Gerenciar alertas automáticos',
        'Estatísticas de uso do plano de segurança'
      ]}
    />
  )
}
