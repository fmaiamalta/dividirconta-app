import {
  calcularTotais,
  getTotalConta,
  getItensNaoAtribuidos,
  getPessoasEmFalta,
  getItensIncompletos,
  getItensIncompletosPorCategoria,
  getGruposDaAtribuicao,
  ajustarAtribuicoesAosGrupos,
} from '../calculo';
import { Conta, Grupo, Item, Atribuicao } from '../../types';

const grupoA: Grupo = { id: 'a', nome: 'A', cor: '#111', numPessoas: 5 };
const grupoB: Grupo = { id: 'b', nome: 'B', cor: '#222', numPessoas: 3 };
const grupoC: Grupo = { id: 'c', nome: 'C', cor: '#333', numPessoas: 2 };

function contaBase(overrides: Partial<Conta> = {}): Conta {
  return {
    id: 'conta-1',
    nome: 'Teste',
    itens: [],
    grupos: [grupoA, grupoB],
    atribuicoes: [],
    ...overrides,
  };
}

describe('calcularTotais', () => {
  it('dá o valor todo a um grupo numa atribuição exclusiva', () => {
    const item: Item = { id: 'i1', nome: 'Prato', preco: 10, quantidade: 1, categoria: 'comida' };
    const conta = contaBase({
      itens: [item],
      atribuicoes: [{ itemId: 'i1', partes: [{ grupoId: 'a', quantidade: 1 }], exclusivo: true }],
    });
    const totais = calcularTotais(conta);
    expect(totais.find((t) => t.grupoId === 'a')!.total).toBeCloseTo(10);
    expect(totais.find((t) => t.grupoId === 'b')!.total).toBeCloseTo(0);
  });

  it('divide o valor proporcionalmente pelas pessoas de cada grupo', () => {
    const item: Item = { id: 'i1', nome: 'Vinho', preco: 18, quantidade: 1, categoria: 'bebida' };
    const conta = contaBase({
      itens: [item],
      atribuicoes: [
        {
          itemId: 'i1',
          partes: [
            { grupoId: 'a', quantidade: 1 },
            { grupoId: 'b', quantidade: 1 },
          ],
        },
      ],
    });
    const totais = calcularTotais(conta);
    expect(totais.find((t) => t.grupoId === 'a')!.total).toBeCloseTo(9);
    expect(totais.find((t) => t.grupoId === 'b')!.total).toBeCloseTo(9);
  });

  it('reparte de forma desigual quando as quantidades por grupo são diferentes', () => {
    const item: Item = { id: 'i1', nome: 'Refrigerante', preco: 3, quantidade: 3, categoria: 'bebida' };
    const conta = contaBase({
      itens: [item],
      atribuicoes: [
        {
          itemId: 'i1',
          partes: [
            { grupoId: 'a', quantidade: 2 },
            { grupoId: 'b', quantidade: 1 },
          ],
        },
      ],
    });
    const totais = calcularTotais(conta);
    expect(totais.find((t) => t.grupoId === 'a')!.total).toBeCloseTo(6);
    expect(totais.find((t) => t.grupoId === 'b')!.total).toBeCloseTo(3);
  });

  it('ignora itens sem nenhuma atribuição', () => {
    const item: Item = { id: 'i1', nome: 'Prato', preco: 10, quantidade: 1, categoria: 'comida' };
    const conta = contaBase({ itens: [item], atribuicoes: [] });
    const totais = calcularTotais(conta);
    expect(totais.every((t) => t.total === 0)).toBe(true);
  });

  it('aplica a taxa de serviço proporcionalmente ao consumo de cada grupo', () => {
    const item: Item = { id: 'i1', nome: 'Prato', preco: 100, quantidade: 1, categoria: 'comida' };
    const conta = contaBase({
      itens: [item],
      atribuicoes: [{ itemId: 'i1', partes: [{ grupoId: 'a', quantidade: 1 }], exclusivo: true }],
      taxaServicoPercent: 10,
    });
    const totais = calcularTotais(conta);
    expect(totais.find((t) => t.grupoId === 'a')!.total).toBeCloseTo(110);
  });

  it('separa corretamente os totais por categoria (comida/bebida/outro)', () => {
    const itens: Item[] = [
      { id: 'i1', nome: 'Prato', preco: 10, quantidade: 1, categoria: 'comida' },
      { id: 'i2', nome: 'Cerveja', preco: 3, quantidade: 1, categoria: 'bebida' },
      { id: 'i3', nome: 'Saco', preco: 0.5, quantidade: 1, categoria: 'outro' },
    ];
    const conta = contaBase({
      itens,
      atribuicoes: itens.map((i) => ({
        itemId: i.id,
        partes: [{ grupoId: 'a', quantidade: 1 }],
        exclusivo: true,
      })),
    });
    const totalA = calcularTotais(conta).find((t) => t.grupoId === 'a')!;
    expect(totalA.totalComida).toBeCloseTo(10);
    expect(totalA.totalBebida).toBeCloseTo(3);
    expect(totalA.totalOutro).toBeCloseTo(0.5);
    expect(totalA.total).toBeCloseTo(13.5);
  });

  it('soma dos totais por grupo bate certo com o total da conta quando tudo está atribuído', () => {
    const itens: Item[] = [
      { id: 'i1', nome: 'Prato 1', preco: 14.5, quantidade: 1, categoria: 'comida' },
      { id: 'i2', nome: 'Prato 2', preco: 8.9, quantidade: 1, categoria: 'comida' },
      { id: 'i3', nome: 'Vinho', preco: 18, quantidade: 1, categoria: 'bebida' },
    ];
    const atribuicoes: Atribuicao[] = [
      { itemId: 'i1', partes: [{ grupoId: 'a', quantidade: 1 }], exclusivo: true },
      { itemId: 'i2', partes: [{ grupoId: 'b', quantidade: 1 }], exclusivo: true },
      {
        itemId: 'i3',
        partes: [
          { grupoId: 'a', quantidade: 1 },
          { grupoId: 'b', quantidade: 1 },
        ],
      },
    ];
    const conta = contaBase({ itens, atribuicoes });
    const totais = calcularTotais(conta);
    const somaGrupos = totais.reduce((s, t) => s + t.total, 0);
    expect(somaGrupos).toBeCloseTo(getTotalConta(conta));
  });
});

describe('getItensNaoAtribuidos', () => {
  it('devolve só os itens sem nenhuma atribuição', () => {
    const itens: Item[] = [
      { id: 'i1', nome: 'A', preco: 1, quantidade: 1, categoria: 'comida' },
      { id: 'i2', nome: 'B', preco: 1, quantidade: 1, categoria: 'comida' },
    ];
    const conta = contaBase({
      itens,
      atribuicoes: [{ itemId: 'i1', partes: [{ grupoId: 'a', quantidade: 1 }], exclusivo: true }],
    });
    const naoAtribuidos = getItensNaoAtribuidos(conta);
    expect(naoAtribuidos).toHaveLength(1);
    expect(naoAtribuidos[0].id).toBe('i2');
  });
});

describe('getPessoasEmFalta', () => {
  it('devolve 0 para itens de 1 unidade só, mesmo sem atribuição total das pessoas', () => {
    const item: Item = { id: 'i1', nome: 'Garrafa', preco: 18, quantidade: 1, categoria: 'bebida' };
    const conta = contaBase({
      itens: [item],
      atribuicoes: [
        { itemId: 'i1', partes: [{ grupoId: 'a', quantidade: 1 }, { grupoId: 'b', quantidade: 1 }] },
      ],
    });
    expect(getPessoasEmFalta(conta, item)).toBe(0);
  });

  it('devolve 0 numa atribuição exclusiva, mesmo com várias unidades e poucas pessoas no grupo', () => {
    const item: Item = { id: 'i1', nome: 'Pão', preco: 2, quantidade: 3, categoria: 'comida' };
    const conta = contaBase({
      itens: [item],
      grupos: [grupoC],
      atribuicoes: [{ itemId: 'i1', partes: [{ grupoId: 'c', quantidade: 1 }], exclusivo: true }],
    });
    expect(getPessoasEmFalta(conta, item)).toBe(0);
  });

  it('deteta pessoas em falta quando o item foi mesmo dividido por pessoas', () => {
    const item: Item = { id: 'i1', nome: 'Refrigerante', preco: 3, quantidade: 3, categoria: 'bebida' };
    const conta = contaBase({
      itens: [item],
      atribuicoes: [{ itemId: 'i1', partes: [{ grupoId: 'a', quantidade: 2 }] }],
    });
    expect(getPessoasEmFalta(conta, item)).toBe(1);
  });

  it('devolve 0 quando a divisão por pessoas cobre exatamente as unidades', () => {
    const item: Item = { id: 'i1', nome: 'Imperial', preco: 2.5, quantidade: 4, categoria: 'bebida' };
    const conta = contaBase({
      itens: [item],
      atribuicoes: [
        {
          itemId: 'i1',
          partes: [
            { grupoId: 'a', quantidade: 3 },
            { grupoId: 'b', quantidade: 1 },
          ],
        },
      ],
    });
    expect(getPessoasEmFalta(conta, item)).toBe(0);
  });

  it('devolve 0 para um item sem nenhuma atribuição (é tratado como "não atribuído", não "em falta")', () => {
    const item: Item = { id: 'i1', nome: 'X', preco: 3, quantidade: 3, categoria: 'bebida' };
    const conta = contaBase({ itens: [item], atribuicoes: [] });
    expect(getPessoasEmFalta(conta, item)).toBe(0);
  });
});

describe('getItensIncompletos / getItensIncompletosPorCategoria', () => {
  it('junta itens não atribuídos e itens parcialmente divididos, sem duplicar', () => {
    const itens: Item[] = [
      { id: 'i1', nome: 'Sem atribuição', preco: 1, quantidade: 1, categoria: 'comida' },
      { id: 'i2', nome: 'Parcial', preco: 3, quantidade: 3, categoria: 'bebida' },
      { id: 'i3', nome: 'Completo', preco: 1, quantidade: 1, categoria: 'outro' },
    ];
    const conta = contaBase({
      itens,
      atribuicoes: [
        { itemId: 'i2', partes: [{ grupoId: 'a', quantidade: 1 }] },
        { itemId: 'i3', partes: [{ grupoId: 'a', quantidade: 1 }], exclusivo: true },
      ],
    });
    const incompletos = getItensIncompletos(conta);
    expect(incompletos.map((i) => i.id).sort()).toEqual(['i1', 'i2']);

    const porCategoria = getItensIncompletosPorCategoria(conta);
    expect(porCategoria.comida.map((i) => i.id)).toEqual(['i1']);
    expect(porCategoria.bebida.map((i) => i.id)).toEqual(['i2']);
    expect(porCategoria.outro).toHaveLength(0);
  });
});

describe('ajustarAtribuicoesAosGrupos', () => {
  it('reduz a quantidade de uma parte quando o grupo perde pessoas', () => {
    const atribuicoes: Atribuicao[] = [
      { itemId: 'i1', partes: [{ grupoId: 'a', quantidade: 2 }] },
    ];
    const grupoAReduzido: Grupo = { ...grupoA, numPessoas: 1 };
    const ajustadas = ajustarAtribuicoesAosGrupos(atribuicoes, [grupoAReduzido, grupoB]);
    expect(ajustadas[0].partes[0].quantidade).toBe(1);
  });

  it('remove partes de grupos que deixaram de existir', () => {
    const atribuicoes: Atribuicao[] = [
      {
        itemId: 'i1',
        partes: [
          { grupoId: 'a', quantidade: 1 },
          { grupoId: 'b', quantidade: 1 },
        ],
      },
    ];
    const ajustadas = ajustarAtribuicoesAosGrupos(atribuicoes, [grupoA]);
    expect(ajustadas[0].partes).toHaveLength(1);
    expect(ajustadas[0].partes[0].grupoId).toBe('a');
  });

  it('remove a atribuição inteira se ficar sem nenhuma parte válida', () => {
    const atribuicoes: Atribuicao[] = [{ itemId: 'i1', partes: [{ grupoId: 'b', quantidade: 1 }] }];
    const ajustadas = ajustarAtribuicoesAosGrupos(atribuicoes, [grupoA]);
    expect(ajustadas).toHaveLength(0);
  });

  it('preserva a marca "exclusivo" ao ajustar', () => {
    const atribuicoes: Atribuicao[] = [
      { itemId: 'i1', partes: [{ grupoId: 'a', quantidade: 1 }], exclusivo: true },
    ];
    const ajustadas = ajustarAtribuicoesAosGrupos(atribuicoes, [grupoA, grupoB]);
    expect(ajustadas[0].exclusivo).toBe(true);
  });
});

describe('getGruposDaAtribuicao', () => {
  it('devolve os grupos representados numa atribuição partilhada', () => {
    const conta = contaBase({
      itens: [{ id: 'i1', nome: 'X', preco: 1, quantidade: 1, categoria: 'bebida' }],
      atribuicoes: [
        {
          itemId: 'i1',
          partes: [
            { grupoId: 'a', quantidade: 1 },
            { grupoId: 'b', quantidade: 1 },
          ],
        },
      ],
    });
    const grupos = getGruposDaAtribuicao(conta, 'i1');
    expect(grupos.map((g) => g.id).sort()).toEqual(['a', 'b']);
  });

  it('devolve array vazio para um item sem atribuição', () => {
    const conta = contaBase({
      itens: [{ id: 'i1', nome: 'X', preco: 1, quantidade: 1, categoria: 'bebida' }],
    });
    expect(getGruposDaAtribuicao(conta, 'i1')).toEqual([]);
  });
});

describe('getTotalConta', () => {
  it('soma preço x quantidade de todos os itens, independentemente de atribuições', () => {
    const itens: Item[] = [
      { id: 'i1', nome: 'A', preco: 2.5, quantidade: 4, categoria: 'bebida' },
      { id: 'i2', nome: 'B', preco: 10, quantidade: 1, categoria: 'comida' },
    ];
    const conta = contaBase({ itens });
    expect(getTotalConta(conta)).toBeCloseTo(20);
  });
});