import { Produto } from './database';

export interface CartItemOption {
  id: string;
  grupoId: string;
  grupoNome: string;
  nome: string;
  preco: number;
}

export interface CartItem {
  tempId: string;
  produto: Produto;
  quantidade: number;
  opcionais: CartItemOption[];
  notas: string;
  precoUnitario: number;
  precoTotal: number;
}
