import { Item, Categoria } from '../types';
import { URL_BACKEND } from '../config';

interface ItemExtraido {
  nome: string;
  preco: number;
  quantidade: number;
  categoria: Categoria;
}

interface RespostaAnalise {
  tipoDocumento: string;
  itens: ItemExtraido[];
  erro?: string;
  detalhes?: string;
}

async function pedirAnalise(imagemBase64: string, mediaType: string): Promise<Item[]> {
  const resposta = await fetch(URL_BACKEND, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imagemBase64, mediaType }),
  });

  // Tenta sempre ler o corpo da resposta primeiro, mesmo quando o pedido
  // falhou, porque é lá que vêm os detalhes do erro (ex: erro 500).
  let dados: RespostaAnalise | null = null;
  try {
    dados = await resposta.json();
  } catch {
    // resposta sem JSON válido, seguimos com dados a null
  }

  if (!resposta.ok) {
    const mensagemBase = dados?.erro ?? `O servidor respondeu com erro (${resposta.status})`;
    throw new Error(dados?.detalhes ? `${mensagemBase}: ${dados.detalhes}` : mensagemBase);
  }

  if (!dados) {
    throw new Error('O servidor devolveu uma resposta vazia');
  }

  if (dados.erro) {
    throw new Error(dados.detalhes ? `${dados.erro}: ${dados.detalhes}` : dados.erro);
  }

  if (!dados.itens || dados.itens.length === 0) {
    throw new Error('Não foi possível identificar itens nesta foto');
  }

  return dados.itens.map((item, indice) => ({
    id: `item-${Date.now()}-${indice}`,
    nome: item.nome,
    preco: item.preco,
    quantidade: item.quantidade || 1,
    categoria: item.categoria,
  }));
}

// A primeira chamada ao backend por vezes falha só porque o servidor está
// "a acordar" (a Vercel desliga a função quando está inativa). Por isso
// tentamos até 3 vezes antes de desistir, com uma pequena pausa entre elas.
export async function analisarConta(
  imagemBase64: string,
  mediaType: string
): Promise<Item[]> {
  const tentativasMaximas = 3;
  let ultimoErro: Error | null = null;

  for (let tentativa = 1; tentativa <= tentativasMaximas; tentativa++) {
    try {
      return await pedirAnalise(imagemBase64, mediaType);
    } catch (erro) {
      ultimoErro = erro instanceof Error ? erro : new Error(String(erro));
      // Não vale a pena repetir se a IA respondeu mas não encontrou itens,
      // ou se disse claramente que a foto não é uma conta legível — isso
      // não muda tentando outra vez com a mesma foto.
      const semSentidoRepetir =
        ultimoErro.message.includes('identificar itens') ||
        ultimoErro.message.includes('não parece ser uma conta');
      if (semSentidoRepetir) throw ultimoErro;
      if (tentativa < tentativasMaximas) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
  }

  throw ultimoErro ?? new Error('Falha desconhecida ao analisar a conta');
}
