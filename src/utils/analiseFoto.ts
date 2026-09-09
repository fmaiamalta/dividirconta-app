import { Item, Categoria } from '../types';
import { URL_BACKEND } from '../config';
import { Dicionario } from '../i18n/pt';
import { Idioma } from '../i18n';

// Erros dedicados para os dois casos em que não vale a pena tentar outra
// vez com a mesma foto — usar instanceof em vez de comparar pedaços de
// texto da mensagem, que agora pode vir em PT ou EN consoante o pedido.
class SemItensError extends Error {}
class NaoEContaError extends Error {}

interface ItemExtraido {
  nome: string;
  preco: number;
  quantidade: number;
  categoria: Categoria;
}

interface RespostaAnalise {
  tipoDocumento: string;
  itens: ItemExtraido[];
  codigo?: string;
  erro?: string;
  detalhes?: string;
}

async function pedirAnalise(
  imagemBase64: string,
  mediaType: string,
  idioma: Idioma,
  t: Dicionario
): Promise<Item[]> {
  const resposta = await fetch(URL_BACKEND, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imagemBase64, mediaType, idioma }),
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
    const mensagemBase = dados?.erro ?? t.analiseFoto.erroServidorStatus(resposta.status);
    throw new Error(dados?.detalhes ? `${mensagemBase}: ${dados.detalhes}` : mensagemBase);
  }

  if (!dados) {
    throw new Error(t.analiseFoto.erroRespostaVazia);
  }

  // dados.erro/detalhes vêm do backend, já no idioma pedido.
  if (dados.erro) {
    const mensagem = dados.detalhes ? `${dados.erro}: ${dados.detalhes}` : dados.erro;
    if (dados.codigo === 'nao_e_conta') throw new NaoEContaError(mensagem);
    throw new Error(mensagem);
  }

  if (!dados.itens || dados.itens.length === 0) {
    throw new SemItensError(t.analiseFoto.erroSemItens);
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
  mediaType: string,
  idioma: Idioma,
  t: Dicionario
): Promise<Item[]> {
  const tentativasMaximas = 3;
  let ultimoErro: Error | null = null;

  for (let tentativa = 1; tentativa <= tentativasMaximas; tentativa++) {
    try {
      return await pedirAnalise(imagemBase64, mediaType, idioma, t);
    } catch (erro) {
      ultimoErro = erro instanceof Error ? erro : new Error(String(erro));
      // Não vale a pena repetir se a IA respondeu mas não encontrou itens,
      // ou se disse claramente que a foto não é uma conta legível — isso
      // não muda tentando outra vez com a mesma foto.
      const semSentidoRepetir = erro instanceof SemItensError || erro instanceof NaoEContaError;
      if (semSentidoRepetir) throw ultimoErro;
      if (tentativa < tentativasMaximas) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
  }

  throw ultimoErro ?? new Error(t.analiseFoto.erroFalhaDesconhecida);
}
