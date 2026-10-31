# TechFlow

Sistema de gestão para assistência técnica: clientes, equipamentos, ordens de serviço e estoque.

## Stack
- Java 21 + Spring Boot 3.4 + Spring Data JPA + Validation
- PostgreSQL
- React + TypeScript + Vite
- Docker Compose

## Executar com Docker
1. Instale Docker e Docker Compose.
2. Na raiz do projeto, execute:
   ```bash
   docker compose up --build
   ```
3. API: http://localhost:8080/api
4. Frontend: http://localhost:5173

A API cria as tabelas automaticamente em desenvolvimento (`ddl-auto=update`). Para produção, configure migrations Flyway e `ddl-auto=validate`.

## Executar manualmente
Backend:
```bash
cd backend
mvn spring-boot:run
```
Frontend:
```bash
cd frontend
npm install
npm run dev
```
Configure `backend/src/main/resources/application.yml` ou variáveis de ambiente conforme `.env.example`.

## Observações
Este é um ponto de partida funcional, não um sistema pronto para operação comercial sem revisão. Antes de produção, implemente autenticação/autorização, auditoria, backups, migrations, política de privacidade, testes adicionais e revisão de segurança. Não há usuário/senha padrão.
