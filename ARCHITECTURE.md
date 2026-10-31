# Arquitetura TechFlow

- `backend`: API REST Spring Boot.
- `frontend`: aplicação React.
- `database`: scripts SQL e futuras migrations.
- `scripts`: automações locais.
- `ai`: contexto e instruções para assistentes de desenvolvimento.

## Endpoints iniciais
- `GET /api/dashboard`
- `GET|POST /api/customers`
- `GET /api/customers/{id}`
- `DELETE /api/customers/{id}`
- `GET|POST /api/equipment`
- `GET|POST /api/service-orders`
- `PATCH /api/service-orders/{id}/status`

## Próximas entregas recomendadas
Autenticação e autorização, CRUD completo de equipamentos e ordens, estoque transacional, financeiro, garantias, auditoria, migrations Flyway e testes de integração.
