import { Conta, Item, TotalPorGrupo, Grupo, Parte, Atribuicao } from '../types';

/**
 * Calcula quanto cada grupo deve pagar.
 * Cada parte de uma atribuição diz quantas pessoas de um grupo consumiram
 * o item; o valor do item divide-se pelo total de pessoas envolvidas
 * (de todos os grupos), e cada grupo fica com a fatia correspondente
 * à sua quantidade.
 */
export function calcularTotais(conta: Conta): TotalPorGrupo[] {
  const totais = new Map<string, TotalPorGrupo>();

  for (const grupo of conta.grupos) {
    totais.set(grupo.id, {
      grupoId: grupo.id,
      nome: grupo.nome,
      cor: grupo.cor,
      totalComida: 0,
      totalBebida: 0,
      totalOutro: 0,
      total: 0,
    });
  }

  for (const atribuicao of conta.atribuicoes) {
    const item = conta.itens.find((i) => i.id === atribuicao.itemId);
    if (!item || atribuicao.partes.length === 0) continue;

    const valorTotal = item.preco * item.quantidade;
    const totalPessoasEnvolvidas = atribuicao.partes.reduce(
      (s, p) => s + p.quantidade,
      0
    );
    if (totalPessoasEnvolvidas === 0) continue;

    const valorPorPessoa = valorTotal / totalPessoasEnvolvidas;

    for (const parte of atribuicao.partes) {
      const t = totais.get(parte.grupoId);
      if (!t) continue;
      const valorDaFatia = valorPorPessoa * parte.quantidade;

      if (item.categoria === 'comida') t.totalComida += valorDaFatia;
      else if (item.categoria === 'bebida') t.totalBebida += valorDaFatia;
      else t.totalOutro += valorDaFatia;
    }
  }

  for (const t of totais.values()) {
    const subtotal = t.totalComida + t.totalBebida + t.totalOutro;
    const taxa = conta.taxaServicoPercent
      ? subtotal * (conta.taxaServicoPercent / 100)
      : 0;
    t.total = subtotal + taxa;
  }

  return Array.from(totais.values());
}

export function getItensNaoAtribuidos(conta: Conta): Item[] {
  const idsAtribuidos = new Set(conta.atribuicoes.map((a) => a.itemId));
  return conta.itens.filter((i) => !idsAtribuidos.has(i.id));
}

// Para qualquer item com mais do que 1 unidade (ex: 3x Bijou, 4x Imperial),
// o número de pessoas atribuídas deve cobrir todas as unidades — mas só
// quando o item foi mesmo dividido por pessoas específicas (via
// "Dividir"). Uma atribuição rápida e exclusiva a um único grupo (marcar
// a caixa e tocar no grupo) significa "este grupo levou tudo", e não
// precisa de nenhuma contagem de pessoas para estar completa.
export function getPessoasEmFalta(conta: Conta, item: Item): number {
  if (item.quantidade <= 1) return 0;
  const atribuicao = conta.atribuicoes.find((a) => a.itemId === item.id);
  if (!atribuicao || atribuicao.exclusivo) return 0;
  const totalAtribuido = atribuicao.partes.reduce((s, p) => s + p.quantidade, 0);
  return Math.max(0, item.quantidade - totalAtribuido);
}

// Um item está incompleto se não tem nenhuma atribuição, ou se tem várias
// unidades e ainda faltam pessoas para cobrir todas.
export function getItensIncompletos(conta: Conta): Item[] {
  const naoAtribuidos = getItensNaoAtribuidos(conta);
  const parciais = conta.itens.filter((i) => getPessoasEmFalta(conta, i) > 0);
  const idsJaContados = new Set(naoAtribuidos.map((i) => i.id));
  return [...naoAtribuidos, ...parciais.filter((i) => !idsJaContados.has(i.id))];
}

// Mesma lista de itens incompletos, mas separada por categoria, para
// mostrar dois alertas distintos na interface (comida e bebida).
export function getItensIncompletosPorCategoria(conta: Conta) {
  const incompletos = getItensIncompletos(conta);
  return {
    comida: incompletos.filter((i) => i.categoria === 'comida'),
    bebida: incompletos.filter((i) => i.categoria === 'bebida'),
    outro: incompletos.filter((i) => i.categoria === 'outro'),
  };
}

export function getTotalConta(conta: Conta): number {
  return conta.itens.reduce((soma, i) => soma + i.preco * i.quantidade, 0);
}

// Quando o número de pessoas de um grupo muda (ou um grupo é removido),
// as atribuições antigas podem ficar com mais pessoas do que as que agora
// existem nesse grupo. Esta função corrige isso: reduz cada parte ao novo
// máximo do grupo, e remove partes cujo grupo já não existe. Se um item
// ficar sem nenhuma parte válida, volta a "por atribuir".
export function ajustarAtribuicoesAosGrupos(
  atribuicoes: Atribuicao[],
  grupos: Grupo[]
): Atribuicao[] {
  const porId = new Map(grupos.map((g) => [g.id, g]));

  return atribuicoes
    .map((atribuicao) => ({
      itemId: atribuicao.itemId,
      exclusivo: atribuicao.exclusivo,
      partes: atribuicao.partes
        .map((parte) => {
          const grupo = porId.get(parte.grupoId);
          if (!grupo) return null;
          return { grupoId: parte.grupoId, quantidade: Math.min(parte.quantidade, grupo.numPessoas) };
        })
        .filter((p): p is Parte => p !== null && p.quantidade > 0),
    }))
    .filter((atribuicao) => atribuicao.partes.length > 0);
}
export function getGruposDaAtribuicao(conta: Conta, itemId: string) {
  const atribuicao = conta.atribuicoes.find((a) => a.itemId === itemId);
  if (!atribuicao) return [];
  const grupoIds = new Set(atribuicao.partes.map((p) => p.grupoId));
  return conta.grupos.filter((g) => grupoIds.has(g.id));
}
