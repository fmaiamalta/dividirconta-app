import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { ModeloGrupos, Conta } from '../types';

const CHAVE_MODELOS = '@divisao-contas/modelos';
const CHAVE_CONTAS = '@divisao-contas/contas';
const CHAVE_BACKUP_CORROMPIDO = '@divisao-contas/backup-corrompido';

// Serializa todas as operações de leitura-modificação-escrita neste
// ficheiro (modelos e contas) numa única fila. Sem isto, duas chamadas
// rápidas a guardarConta (ex: atribuir dois itens em sucessão) podiam
// ambas ler o mesmo estado inicial e a segunda escrita apagava a
// primeira em silêncio.
let filaEscrita: Promise<unknown> = Promise.resolve();

function emFila<T>(tarefa: () => Promise<T>): Promise<T> {
  const resultado = filaEscrita.then(tarefa, tarefa);
  filaEscrita = resultado.then(
    () => undefined,
    () => undefined
  );
  return resultado;
}

// Se o JSON guardado estiver corrompido, não vale a pena só devolver []
// e seguir em frente — a próxima gravação substituiria os dados
// corrompidos, perdendo-os para sempre sem o utilizador saber. Guarda-se
// o texto original numa chave de backup antes de desistir dele.
async function guardarBackupCorrompido(chave: string, texto: string): Promise<void> {
  try {
    const bruto = await AsyncStorage.getItem(CHAVE_BACKUP_CORROMPIDO);
    const lista = bruto ? JSON.parse(bruto) : [];
    lista.push({ chave, texto, quando: Date.now() });
    await AsyncStorage.setItem(CHAVE_BACKUP_CORROMPIDO, JSON.stringify(lista));
  } catch {
    // Se nem isto correr bem, não há mais nada a fazer — pelo menos a
    // app continua a funcionar com uma lista vazia em vez de rebentar.
  }
}

export async function listarModelos(): Promise<ModeloGrupos[]> {
  const texto = await AsyncStorage.getItem(CHAVE_MODELOS);
  if (!texto) return [];
  try {
    return JSON.parse(texto);
  } catch {
    await guardarBackupCorrompido(CHAVE_MODELOS, texto);
    return [];
  }
}

// Cria um modelo novo, ou substitui um existente com o mesmo id.
export async function guardarModelo(modelo: ModeloGrupos): Promise<ModeloGrupos[]> {
  return emFila(async () => {
    const atuais = await listarModelos();
    const semEsteId = atuais.filter((m) => m.id !== modelo.id);
    const novos = [...semEsteId, modelo];
    await AsyncStorage.setItem(CHAVE_MODELOS, JSON.stringify(novos));
    return novos;
  });
}

export async function apagarModelo(id: string): Promise<ModeloGrupos[]> {
  return emFila(async () => {
    const atuais = await listarModelos();
    const novos = atuais.filter((m) => m.id !== id);
    await AsyncStorage.setItem(CHAVE_MODELOS, JSON.stringify(novos));
    return novos;
  });
}

// Copia a foto tirada (que fica num sítio temporário do sistema) para uma
// pasta própria da app, para não desaparecer quando o telemóvel limpa a
// cache. Devolve o novo caminho, para guardar na conta.
export async function guardarFotoPermanente(uriOriginal: string): Promise<string | undefined> {
  try {
    const pasta = `${FileSystem.documentDirectory}fotos-contas/`;
    const info = await FileSystem.getInfoAsync(pasta);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(pasta, { intermediates: true });
    }
    const sufixo = Math.random().toString(36).slice(2, 8);
    const destino = `${pasta}${Date.now()}-${sufixo}.jpg`;
    await FileSystem.copyAsync({ from: uriOriginal, to: destino });
    return destino;
  } catch {
    // Se falhar, a conta continua a funcionar, só sem foto guardada
    return undefined;
  }
}

async function apagarFicheiroFoto(uri?: string): Promise<void> {
  if (!uri) return;
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    // sem problema, o ficheiro pode já não existir
  }
}

// Versão exportada, para a app poder limpar uma foto que copiou mas
// acabou por não usar (ex: o utilizador tira outra foto por cima).
export const apagarFotoPermanente = apagarFicheiroFoto;

export async function listarContas(): Promise<Conta[]> {
  const texto = await AsyncStorage.getItem(CHAVE_CONTAS);
  if (!texto) return [];
  try {
    return JSON.parse(texto);
  } catch {
    await guardarBackupCorrompido(CHAVE_CONTAS, texto);
    return [];
  }
}

// Cria uma conta nova, ou substitui uma existente com o mesmo id (é assim
// que se vai guardando o progresso à medida que atribuis itens).
export async function guardarConta(conta: Conta): Promise<Conta[]> {
  return emFila(async () => {
    const atuais = await listarContas();
    const semEstaId = atuais.filter((c) => c.id !== conta.id);
    const novas = [...semEstaId, conta];
    await AsyncStorage.setItem(CHAVE_CONTAS, JSON.stringify(novas));
    return novas;
  });
}

export async function apagarConta(id: string): Promise<Conta[]> {
  return emFila(async () => {
    const atuais = await listarContas();
    const alvo = atuais.find((c) => c.id === id);
    const novas = atuais.filter((c) => c.id !== id);
    await AsyncStorage.setItem(CHAVE_CONTAS, JSON.stringify(novas));
    await apagarFicheiroFoto(alvo?.fotoUri);
    return novas;
  });
}
