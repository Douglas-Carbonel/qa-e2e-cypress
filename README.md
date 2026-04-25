# QA E2E Cypress

Projeto de automação end-to-end com Cypress usando o SauceDemo como aplicação de prática.

## Tecnologias
- Cypress
- JavaScript
- Node.js

## Estrutura
```txt
cypress/
  e2e/
    saucedemo/
      login/
      inventory/
      cart/
      checkout/
  fixtures/
  support/
```

## Cenários cobertos
- login com sucesso
- login com erro
- detalhe do produto
- ordenação de produtos
- remoção de item do carrinho
- checkout

## Instalação
```bash
npm install
```

## Executar em modo interativo
```bash
npx cypress open
```

## Executar em modo headless
```bash
npx cypress run
```
