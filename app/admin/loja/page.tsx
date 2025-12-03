import PlaceholderPage from '@/components/PlaceholderPage'

export default function LojaPage() {
  return (
    <PlaceholderPage
      title="Loja / Add-ons"
      description="Gerencie a loja de add-ons e produtos adicionais."
      icon="🛒"
      features={[
        'Criar e editar add-ons',
        'Definir preços e promoções',
        'Gerenciar estoque de créditos',
        'Ver histórico de compras',
        'Configurar bundles e pacotes'
      ]}
    />
  )
}
