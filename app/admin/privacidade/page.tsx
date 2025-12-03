import PlaceholderPage from '@/components/PlaceholderPage'

export default function PrivacidadePage() {
  return (
    <PlaceholderPage
      title="Privacidade"
      description="Configure políticas de privacidade e proteção de dados."
      icon="🔒"
      features={[
        'Editar política de privacidade',
        'Configurar retenção de dados',
        'Gerenciar consentimentos',
        'Logs de acesso a dados',
        'Configurar anonimização'
      ]}
    />
  )
}
