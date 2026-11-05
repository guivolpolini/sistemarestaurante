export type MesaStatus = 'livre' | 'ocupada' | 'chamando' | 'fechando';
export type SetorPreparo = 'cozinha' | 'bar';
export type ComandaStatus = 'aberta' | 'aguardando_pagamento' | 'fechada';
export type PedidoStatus = 'pendente_garcom' | 'em_preparo' | 'pronto' | 'entregue' | 'cancelado';
export type ChamadoMotivo = 'garcom' | 'gelo_limao' | 'talheres' | 'duvida' | 'limpeza';
export type ChamadoStatus = 'pendente' | 'atendido';

export interface RestauranteConfig {
  id: string;
  nome: string;
  logo_url: string | null;
  chave_pix: string | null;
  google_review_url: string | null;
  whatsapp_gerente: string | null;
  exigir_aprovacao_garcom: boolean;
  taxa_servico_padrao: number;
  criado_em: string;
  atualizado_em: string;
}

export interface Mesa {
  id: string;
  numero: number;
  status: MesaStatus;
  session_token: string;
  comanda_atual_id: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface Categoria {
  id: string;
  nome: string;
  icone: string;
  ordem: number;
  ativo: boolean;
  criado_em: string;
}

export interface ItemOpcional {
  id: string;
  grupo_id: string;
  nome: string;
  preco_adicional: number;
  disponivel: boolean;
  criado_em: string;
}

export interface GrupoOpcional {
  id: string;
  produto_id: string;
  nome: string;
  obrigatorio: boolean;
  min_opcoes: number;
  max_opcoes: number;
  criado_em: string;
  itens?: ItemOpcional[];
}

export interface Produto {
  id: string;
  categoria_id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  imagem_url: string | null;
  setor: SetorPreparo;
  disponivel: boolean;
  ordem: number;
  criado_em: string;
  atualizado_em: string;
  grupos?: GrupoOpcional[];
}

export interface Comanda {
  id: string;
  mesa_id: string;
  status: ComandaStatus;
  total_itens: number;
  taxa_servico: number;
  valor_final: number;
  aberta_em: string;
  fechada_em: string | null;
  mesa?: Mesa;
}

export interface PedidoItemOpcional {
  id: string;
  pedido_item_id: string;
  item_opcional_id: string;
  nome_snapshot: string;
  preco_snapshot: number;
}

export interface PedidoItem {
  id: string;
  pedido_id: string;
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
  notas: string | null;
  criado_em: string;
  produto?: Produto;
  opcionais?: PedidoItemOpcional[];
}

export interface Pedido {
  id: string;
  comanda_id: string;
  mesa_id: string;
  idempotency_key: string | null;
  status: PedidoStatus;
  observacao: string | null;
  criado_em: string;
  atualizado_em: string;
  mesa?: Mesa;
  itens?: PedidoItem[];
}

export interface Chamado {
  id: string;
  mesa_id: string;
  motivo: ChamadoMotivo;
  status: ChamadoStatus;
  criado_em: string;
  atendido_em: string | null;
  mesa?: Mesa;
}

export interface Avaliacao {
  id: string;
  comanda_id: string;
  mesa_id: string;
  estrelas: number;
  feedback_texto: string | null;
  enviado_para_google: boolean;
  criado_em: string;
}
