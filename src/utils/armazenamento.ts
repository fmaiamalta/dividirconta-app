import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { ModeloGrupos, Conta } from '../types';

const CHAVE_MODELOS = '@divisao-contas/modelos';
const CHAVE_CONTAS = '@divisao-contas/contas';

export async function listarModelos(): Promise<ModeloGrupos[]> {
  try {
    const texto = await AsyncStorage.getItem(CHAVE_MODELOS);
    if (!texto) return [];
    return JSON.parse(texto);
  } catch {
    return [];
  }
}

// Cria um modelo novo, ou substitui um existente com o mesmo id.
export async function guardarModelo(modelo: ModeloGrupos): Promise<ModeloGrupos[]> {
  const atuais = await listarModelos();
  const semEsteId = atuais.filter((m) => m.id !== modelo.id);
  const novos = [...semEsteId, modelo];
  await AsyncStorage.setItem(CHAVE_MODELOS, JSON.stringify(novos));
  return novos;
}

export async function apagarModelo(id: string): Promise<ModeloGrupos[]> {
  const atuais = await listarModelos();
  const novos = atuais.filter((m) => m.id !== id);
  await AsyncStorage.setItem(CHAVE_MODELOS, JSON.stringify(novos));
  return novos;
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
    const destino = `${pasta}${Date.now()}.jpg`;
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
  try {
    const texto = await AsyncStorage.getItem(CHAVE_CONTAS);
    if (!texto) return [];
    return JSON.parse(texto);
  } catch {
    return [];
  }
}

// Cria uma conta nova, ou substitui uma existente com o mesmo id (é assim
// que se vai guardando o progresso à medida que atribuis itens).
export async function guardarConta(conta: Conta): Promise<Conta[]> {
  const atuais = await listarContas();
  const semEstaId = atuais.filter((c) => c.id !== conta.id);
  const novas = [...semEstaId, conta];
  await AsyncStorage.setItem(CHAVE_CONTAS, JSON.stringify(novas));
  return novas;
}

export async function apagarConta(id: string): Promise<Conta[]> {
  const atuais = await listarContas();
  const alvo = atuais.find((c) => c.id === id);
  const novas = atuais.filter((c) => c.id !== id);
  await AsyncStorage.setItem(CHAVE_CONTAS, JSON.stringify(novas));
  await apagarFicheiroFoto(alvo?.fotoUri);
  return novas;
}
