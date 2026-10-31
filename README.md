# TechFlow

Sistema de gestão para assistências técnicas, empresas de informática e serviços de manutenção de equipamentos.

## Visão geral

O TechFlow foi criado para centralizar e simplificar a gestão de uma assistência técnica, com foco em:
- clientes
- equipamentos
- ordens de serviço
- estoque
- vendas
- financeiro
- relatórios

## Funcionalidades da versão inicial

- Dashboard operacional com KPI's
- Cadastro de clientes
- Cadastro de equipamentos
- Abertura de ordens de serviço
- Controle de peças e estoque
- Gestão de status e prioridades
- Dados persistidos em arquivo JSON local
- Interface web simples e responsiva

## Tecnologias usadas

- Node.js
- Express
- JavaScript
- HTML
- CSS

## Como executar

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor:
   ```bash
   npm start
   ```

3. Acesse no navegador:
   ```bash
   http://localhost:3000
   ```

## Estrutura do projeto

```text
techflow/
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── data/
│   └── db.json
├── .env.example
├── .gitignore
├── package.json
├── README.md
├── server.js
└──
```

## Próximos passos sugeridos

- Autenticação de usuários
- CRUD completo de clientes, pedidos e estoque
- Integração com banco de dados relacional
- Relatórios financeiros e de produtividade
- Área administrativa com permissões
- Deploy em produção
