# 🧪 Testes - Radar Narcisista BR

## Instalação das Dependências

Antes de rodar os testes, instale as dependências:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom @types/jest
```

## Comandos

```bash
# Rodar todos os testes
npm test

# Rodar testes em modo watch (re-executa ao salvar)
npm run test:watch

# Rodar testes com cobertura
npm run test:coverage
```

## Estrutura dos Testes

```
__tests__/
├── pages.test.tsx      # Testes de páginas e componentes
├── README.md           # Este arquivo
```

## O que é testado

### Páginas Públicas
- ✅ Página 404 renderiza corretamente
- ✅ Links de navegação funcionam

### Componentes de Segurança
- ✅ Botão de emergência existe e é acessível
- ✅ Função de saída limpa dados locais

### Utilitários
- ✅ Geração de hash é consistente
- ✅ Validação de email funciona
- ✅ Lista de admins é verificada corretamente

### Internacionalização
- ✅ Traduções existem para PT-BR, EN, ES
- ✅ Todas as chaves estão presentes em todos os idiomas

### Segurança
- ✅ Sanitização de input remove scripts maliciosos
- ✅ Saída de emergência limpa localStorage

## Adicionando Novos Testes

1. Crie um arquivo `*.test.tsx` na pasta `__tests__/`
2. Importe as funções de teste:
```tsx
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
```

3. Escreva seus testes:
```tsx
describe('Meu Componente', () => {
  it('deve fazer algo', () => {
    render(<MeuComponente />)
    expect(screen.getByText('Texto')).toBeInTheDocument()
  })
})
```

## Cobertura de Código

Após rodar `npm run test:coverage`, um relatório será gerado em `coverage/`.

Abra `coverage/lcov-report/index.html` no navegador para ver o relatório visual.
