-- Estrutura inicial. O Hibernate também cria as tabelas no perfil local.
CREATE TABLE IF NOT EXISTS customers (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(140) NOT NULL,
  phone VARCHAR(30),
  email VARCHAR(160),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
