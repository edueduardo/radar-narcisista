import PlaceholderPage from '@/components/PlaceholderPage'

export default function RelatoriosAdminPage() {
  return (
    <PlaceholderPage
      title="Relatórios"
      description="Visualize e exporte relatórios do sistema."
      icon="📄"
      features={[
        'Relatórios de uso por período',
        'Métricas de engajamento',
        'Relatórios financeiros',
        'Exportar para PDF/Excel',
        'Agendar envio automático'
      ]}
    />
  )
}
