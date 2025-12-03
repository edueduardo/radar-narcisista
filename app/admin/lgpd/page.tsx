import PlaceholderPage from '@/components/PlaceholderPage'

export default function LGPDPage() {
  return (
    <PlaceholderPage
      title="LGPD / Exportar Dados"
      description="Ferramentas de conformidade com a LGPD."
      icon="📤"
      features={[
        'Exportar dados de usuário',
        'Processar solicitações de exclusão',
        'Relatório de conformidade LGPD',
        'Histórico de solicitações',
        'Templates de resposta'
      ]}
    />
  )
}
