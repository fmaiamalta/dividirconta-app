// Modelo de dados da divisão de contas

export type Categoria = 'comida' | 'bebida' | 'outro';

export interface Item {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  categoria: Categoria;
}

// Um grupo pode ser uma família, um casal, ou qualquer bloco de pessoas.
// numPessoas é só informativo (ajuda a saber quantas pessoas no máximo
// podem ter partilhado uma bebida deste grupo).
export interface Grupo {
  id: string;
  nome: string;
  cor: string; // código hex, ex: '#3D2C25'
  numPessoas: number;
}

// Um conjunto de grupos guardado com um nome (ex: "Jantar de sábado"),
// para reutilizar sem teres de configurar tudo outra vez.
export interface ModeloGrupos {
  id: string;
  nome: string;
  grupos: Grupo[];
}

// Uma parte liga um item a um grupo, com o número de pessoas desse grupo
// que consumiram o item. Para comida (exclusiva de um grupo), há só uma
// parte com quantidade 1. Para bebida partilhada entre grupos, pode haver
// várias partes, ex: Grupo A com 1 pessoa e Grupo B com 1 pessoa.
export interface Parte {
  grupoId: string;
  quantidade: number;
}

export interface Atribuicao {
  itemId: string;
  partes: Parte[];
  // true quando o item foi atribuído de forma rápida a um único grupo
  // (marcar a caixa e tocar no grupo): significa "este grupo levou tudo",
  // independentemente de quantas pessoas ou unidades existem. Nesse caso
  // não faz sentido validar se "faltam pessoas" — só se aplica quando o
  // item foi mesmo dividido por pessoas específicas (via "Dividir").
  exclusivo?: boolean;
}

export interface Conta {
  id: string;
  // Nome guardado tal como foi calculado na criação (inclui o "Nova conta
  // de..." já traduzido nesse momento) — serve de fallback para contas
  // antigas. Para mostrar o nome atualizado ao idioma corrente, usa
  // nomeExibicaoConta() em vez deste campo diretamente.
  nome: string;
  // Nome do modelo de grupos que deu origem a esta conta (texto do
  // utilizador, nunca traduzido). Undefined em contas sem modelo de
  // origem (nome genérico) ou guardadas antes deste campo existir.
  nomeModeloOrigem?: string;
  itens: Item[];
  grupos: Grupo[];
  atribuicoes: Atribuicao[];
  taxaServicoPercent?: number; // opcional, ex: 10 para 10%
  fotoUri?: string; // caminho local da foto original, guardada no telemóvel
  criadaEm?: number; // timestamp, para ordenar e mostrar a data
}

export interface TotalPorGrupo {
  grupoId: string;
  nome: string;
  cor: string;
  totalComida: number;
  totalBebida: number;
  totalOutro: number;
  total: number;
}

// Cores para diferenciar grupos: todas em tom pastel, para não destoarem
// entre si. O castanho da marca fica de fora de propósito, reservado para
// texto e botões, onde precisa de se destacar com contraste.
export const PALETA_CORES = [
  '#E8B08C', // salmão pastel
  '#9FD8BE', // verde-menta pastel
  '#C3B2E0', // lilás pastel
  '#F5C68A', // laranja pastel
  '#9CCFCF', // turquesa pastel
  '#E8AECB', // rosa pastel
  '#CBE0A0', // verde-lima pastel
  '#F2D98A', // amarelo pastel
];
