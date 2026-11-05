-- ==============================================================================
-- SISTEMA DE AUTOATENDIMENTO E GESTÃO OPERACIONAL DE RESTAURANTES (PHASE 1)
-- Compatível com Supabase (PostgreSQL 15+)
-- ==============================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE mesa_status AS ENUM ('livre', 'ocupada', 'chamando', 'fechando');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE setor_preparo AS ENUM ('cozinha', 'bar');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE comanda_status AS ENUM ('aberta', 'aguardando_pagamento', 'fechada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE pedido_status AS ENUM ('pendente_garcom', 'em_preparo', 'pronto', 'entregue', 'cancelado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE chamado_motivo AS ENUM ('garcom', 'gelo_limao', 'talheres', 'duvida', 'limpeza');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE chamado_status AS ENUM ('pendente', 'atendido');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABELAS PRINCIPAIS

-- Configuração Global do Estabelecimento
CREATE TABLE IF NOT EXISTS restaurante_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL DEFAULT 'Restaurante Exemplo',
    logo_url TEXT,
    chave_pix TEXT,
    google_review_url TEXT,
    whatsapp_gerente VARCHAR(20),
    exigir_aprovacao_garcom BOOLEAN NOT NULL DEFAULT true,
    taxa_servico_padrao NUMERIC(4, 2) NOT NULL DEFAULT 10.00,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Mesas do Estabelecimento
CREATE TABLE IF NOT EXISTS mesas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero INTEGER NOT NULL UNIQUE,
    status mesa_status NOT NULL DEFAULT 'livre',
    session_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
    comanda_atual_id UUID,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categorias do Cardápio
CREATE TABLE IF NOT EXISTS categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(60) NOT NULL,
    icone VARCHAR(30) DEFAULT 'Utensils',
    ordem INTEGER NOT NULL DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Produtos / Pratos
CREATE TABLE IF NOT EXISTS produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    categoria_id UUID NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco NUMERIC(10, 2) NOT NULL CHECK (preco >= 0),
    imagem_url TEXT,
    setor setor_preparo NOT NULL DEFAULT 'cozinha',
    disponivel BOOLEAN NOT NULL DEFAULT true,
    ordem INTEGER NOT NULL DEFAULT 0,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Grupos de Opcionais (ex: Ponto da Carne, Molhos, Adicionais)
CREATE TABLE IF NOT EXISTS grupos_opcionais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    nome VARCHAR(80) NOT NULL,
    obrigatorio BOOLEAN NOT NULL DEFAULT false,
    min_opcoes INTEGER NOT NULL DEFAULT 0,
    max_opcoes INTEGER NOT NULL DEFAULT 1,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Itens de Opcionais (ex: Ao Ponto, Mal Passado, Queijo Extra)
CREATE TABLE IF NOT EXISTS itens_opcionais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grupo_id UUID NOT NULL REFERENCES grupos_opcionais(id) ON DELETE CASCADE,
    nome VARCHAR(80) NOT NULL,
    preco_adicional NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (preco_adicional >= 0),
    disponivel BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comandas da Mesa
CREATE TABLE IF NOT EXISTS comandas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mesa_id UUID NOT NULL REFERENCES mesas(id) ON DELETE RESTRICT,
    status comanda_status NOT NULL DEFAULT 'aberta',
    total_itens NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    taxa_servico NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    valor_final NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    aberta_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fechada_em TIMESTAMPTZ
);

-- Pedidos vinculados à Comanda
CREATE TABLE IF NOT EXISTS pedidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comanda_id UUID NOT NULL REFERENCES comandas(id) ON DELETE CASCADE,
    mesa_id UUID NOT NULL REFERENCES mesas(id) ON DELETE CASCADE,
    idempotency_key TEXT UNIQUE,
    status pedido_status NOT NULL DEFAULT 'pendente_garcom',
    observacao TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Itens do Pedido
CREATE TABLE IF NOT EXISTS pedido_itens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
    quantidade INTEGER NOT NULL DEFAULT 1 CHECK (quantidade > 0),
    preco_unitario NUMERIC(10, 2) NOT NULL,
    notas TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Opcionais selecionados para o Item do Pedido
CREATE TABLE IF NOT EXISTS pedido_item_opcionais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pedido_item_id UUID NOT NULL REFERENCES pedido_itens(id) ON DELETE CASCADE,
    item_opcional_id UUID NOT NULL REFERENCES itens_opcionais(id) ON DELETE RESTRICT,
    nome_snapshot VARCHAR(80) NOT NULL,
    preco_snapshot NUMERIC(10, 2) NOT NULL DEFAULT 0.00
);

-- Chamados rápidos da Mesa (Chamar Garçom)
CREATE TABLE IF NOT EXISTS chamados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mesa_id UUID NOT NULL REFERENCES mesas(id) ON DELETE CASCADE,
    motivo chamado_motivo NOT NULL DEFAULT 'garcom',
    status chamado_status NOT NULL DEFAULT 'pendente',
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atendido_em TIMESTAMPTZ
);

-- Avaliações do Cliente (Funil QR Avalia)
CREATE TABLE IF NOT EXISTS avaliacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comanda_id UUID NOT NULL REFERENCES comandas(id) ON DELETE CASCADE,
    mesa_id UUID NOT NULL REFERENCES mesas(id) ON DELETE CASCADE,
    estrelas INTEGER NOT NULL CHECK (estrelas >= 1 AND estrelas <= 5),
    feedback_texto TEXT,
    enviado_para_google BOOLEAN NOT NULL DEFAULT false,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ÍNDICES DE PERFORMANCE E CONSULTAS FREQUENTES
CREATE INDEX IF NOT EXISTS idx_mesas_numero ON mesas(numero);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_produtos_disponivel ON produtos(disponivel);
CREATE INDEX IF NOT EXISTS idx_pedidos_comanda ON pedidos(comanda_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_mesa ON pedidos(mesa_id);
CREATE INDEX IF NOT EXISTS idx_chamados_mesa_status ON chamados(mesa_id, status);
CREATE INDEX IF NOT EXISTS idx_comandas_mesa_status ON comandas(mesa_id, status);

-- 5. ATIVAÇÃO SUPABASE REALTIME (WebSockets)
ALTER PUBLICATION supabase_realtime ADD TABLE mesas;
ALTER PUBLICATION supabase_realtime ADD TABLE pedidos;
ALTER PUBLICATION supabase_realtime ADD TABLE chamados;
ALTER PUBLICATION supabase_realtime ADD TABLE produtos;
ALTER PUBLICATION supabase_realtime ADD TABLE comandas;

-- Habilita Replica Identity Full para receber payloads completos nos eventos de UPDATE
ALTER TABLE mesas REPLICA IDENTITY FULL;
ALTER TABLE pedidos REPLICA IDENTITY FULL;
ALTER TABLE chamados REPLICA IDENTITY FULL;
ALTER TABLE produtos REPLICA IDENTITY FULL;
ALTER TABLE comandas REPLICA IDENTITY FULL;
