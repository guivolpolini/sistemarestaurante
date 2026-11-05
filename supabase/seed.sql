-- ==============================================================================
-- DADOS INICIAIS DE TESTE (SEED) - RESTAURANTE DEMO
-- ==============================================================================

-- 1. CONFIGURAÇÃO GERAL
INSERT INTO restaurante_config (id, nome, chave_pix, google_review_url, whatsapp_gerente, exigir_aprovacao_garcom, taxa_servico_padrao)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Bistrô & Burger Artesanal',
    'pix@bistroartesanal.com.br',
    'https://maps.google.com/?q=bistro+artesanal',
    '11999999999',
    true,
    10.00
) ON CONFLICT (id) DO NOTHING;

-- 2. MESAS (1 a 12)
INSERT INTO mesas (numero, status, session_token) VALUES
(1, 'livre', 'token_mesa_01'),
(2, 'livre', 'token_mesa_02'),
(3, 'ocupada', 'token_mesa_03'),
(4, 'livre', 'token_mesa_04'),
(5, 'livre', 'token_mesa_05'),
(6, 'livre', 'token_mesa_06'),
(7, 'livre', 'token_mesa_07'),
(8, 'livre', 'token_mesa_08'),
(9, 'livre', 'token_mesa_09'),
(10, 'livre', 'token_mesa_10'),
(11, 'livre', 'token_mesa_11'),
(12, 'livre', 'token_mesa_12')
ON CONFLICT (numero) DO NOTHING;

-- 3. CATEGORIAS
INSERT INTO categorias (id, nome, icone, ordem) VALUES
('c0000000-0000-0000-0000-000000000001', 'Hambúrgueres Artesanais', 'Beef', 1),
('c0000000-0000-0000-0000-000000000002', 'Porções & Entradas', 'UtensilsCrossed', 2),
('c0000000-0000-0000-0000-000000000003', 'Chopps & Cervejas', 'Beer', 3),
('c0000000-0000-0000-0000-000000000004', 'Bebidas & Sucos', 'CupSoda', 4),
('c0000000-0000-0000-0000-000000000005', 'Sobremesas', 'IceCream', 5)
ON CONFLICT (id) DO NOTHING;

-- 4. PRODUTOS

-- Hambúrgueres
INSERT INTO produtos (id, categoria_id, nome, descricao, preco, imagem_url, setor, ordem) VALUES
('p0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Smash Bacon Supreme', 'Pão brioche selado na manteiga, dois blends smash de 90g, queijo cheddar inglês duplo, bacon crocante em tiras e maionese defumada.', 38.90, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', 'cozinha', 1),
('p0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Clássico Cheeseburger', 'Pão de batata macio, burger alto de 160g bovino grelhado no fogo, queijo prato derretido, picles artesanal e molho especial.', 32.00, 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80', 'cozinha', 2),
('p0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'Truffled Melt Burger', 'Blend Angus 180g, cogumelos salteados no azeite trufado, queijo gruyère derretido e rúcula fresca no pão australiano.', 46.50, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80', 'cozinha', 3),

-- Porções
('p0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', 'Batata Rústica com Alecrim', 'Batatas cortadas à mão com casca douradas e crocantes, salpicadas com sal grosso, alho confitado e alecrim fresco. Acompanha maionese verde da casa.', 26.00, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80', 'cozinha', 1),
('p0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 'Coxinha de Costela Sem Massa (6 un)', 'Costela bovina desfiada marinada na cerveja preta por 12 horas, empanada na farinha panko crocante. Acompanha geleia de pimenta.', 34.00, 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop&q=80', 'cozinha', 2),

-- Bebidas & Chopp
('p0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000003', 'Chopp Pilsen Artesanal 500ml', 'Chopp leve, puro malte, tirado bem gelado na serpentina com colarinho cremoso.', 14.00, 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&auto=format&fit=crop&q=80', 'bar', 1),
('p0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000003', 'Chopp IPA Lupulado 500ml', 'Cerveja estilo American IPA com aroma cítrico marcante e amargor equilibrado.', 18.00, 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&auto=format&fit=crop&q=80', 'bar', 2),
('p0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000004', 'Limonada Suíça com Hortelã', 'Suco de limão taiti batido com gelo, leite condensado e folhas de hortelã fresca.', 12.00, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80', 'bar', 1),
('p0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000004', 'Refrigerante Lata 350ml', 'Opções: Coca-Cola original, Coca Zero, Guaraná Antarctica ou Água Tônica.', 7.50, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80', 'bar', 2)
ON CONFLICT (id) DO NOTHING;

-- 5. GRUPOS DE OPCIONAIS PARA O HAMBÚRGUER SMASH BACON SUPREME
INSERT INTO grupos_opcionais (id, produto_id, nome, obrigatorio, min_opcoes, max_opcoes) VALUES
('g0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'Ponto da Carne', true, 1, 1),
('g0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000001', 'Turbine seu Burger (Adicionais)', false, 0, 3)
ON CONFLICT (id) DO NOTHING;

-- Itens do Grupo 'Ponto da Carne'
INSERT INTO itens_opcionais (id, grupo_id, nome, preco_adicional) VALUES
('o0000000-0000-0000-0000-000000000001', 'g0000000-0000-0000-0000-000000000001', 'Ao Ponto para Mal Passado (Rosado)', 0.00),
('o0000000-0000-0000-0000-000000000002', 'g0000000-0000-0000-0000-000000000001', 'Ao Ponto da Casa', 0.00),
('o0000000-0000-0000-0000-000000000003', 'g0000000-0000-0000-0000-000000000001', 'Bem Passado', 0.00)
ON CONFLICT (id) DO NOTHING;

-- Itens do Grupo 'Turbine seu Burger'
INSERT INTO itens_opcionais (id, grupo_id, nome, preco_adicional) VALUES
('o0000000-0000-0000-0000-000000000004', 'g0000000-0000-0000-0000-000000000002', 'Hambúrguer Smash Extra (+90g)', 8.00),
('o0000000-0000-0000-0000-000000000005', 'g0000000-0000-0000-0000-000000000002', 'Cheddar Inglês Dobrado', 5.00),
('o0000000-0000-0000-0000-000000000006', 'g0000000-0000-0000-0000-000000000002', 'Farofa de Bacon Crocante', 4.50)
ON CONFLICT (id) DO NOTHING;
