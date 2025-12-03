import PlaceholderPage from '@/components/PlaceholderPage'

export default function LogsLegaisPage() {
  return (
    <PlaceholderPage
      title="Logs Legais"
      description="Logs de auditoria para fins legais e compliance."
      icon="📜"
      features={[
        'Logs de acesso ao sistema',
        'Histórico de alterações',
        'Exportar logs por período',
        'Filtrar por tipo de ação',
        'Retenção configurável'
      ]}
    />
  )
}
