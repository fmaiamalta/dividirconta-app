// Simulações em memória do AsyncStorage e do sistema de ficheiros, para
// testar a lógica de guardar/apagar sem tocar num telemóvel a sério.

const memoriaStorage = new Map<string, string>();

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((chave: string) => Promise.resolve(memoriaStorage.get(chave) ?? null)),
  setItem: jest.fn((chave: string, valor: string) => {
    memoriaStorage.set(chave, valor);
    return Promise.resolve();
  }),
  removeItem: jest.fn((chave: string) => {
    memoriaStorage.delete(chave);
    return Promise.resolve();
  }),
}));

const ficheirosExistentes = new Set<string>();

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///documentos/',
  getInfoAsync: jest.fn((uri: string) => Promise.resolve({ exists: ficheirosExistentes.has(uri) })),
  makeDirectoryAsync: jest.fn((uri: string) => {
    ficheirosExistentes.add(uri);
    return Promise.resolve();
  }),
  copyAsync: jest.fn(({ from, to }: { from: string; to: string }) => {
    if (!ficheirosExistentes.has(from) && !from.startsWith('temp://')) {
      return Promise.reject(new Error('origem não existe'));
    }
    ficheirosExistentes.add(to);
    return Promise.resolve();
  }),
  deleteAsync: jest.fn((uri: string) => {
    ficheirosExistentes.delete(uri);
    return Promise.resolve();
  }),
}));

import {
  listarModelos,
  guardarModelo,
  apagarModelo,
  listarContas,
  guardarConta,
  apagarConta,
  guardarFotoPermanente,
  apagarFotoPermanente,
} from '../armazenamento';
import { ModeloGrupos, Conta } from '../../types';

beforeEach(() => {
  memoriaStorage.clear();
  ficheirosExistentes.clear();
});

describe('modelos de grupos', () => {
  const modelo: ModeloGrupos = {
    id: 'm1',
    nome: 'Jantar',
    grupos: [{ id: 'a', nome: 'A', cor: '#111', numPessoas: 3 }],
  };

  it('começa vazio', async () => {
    expect(await listarModelos()).toEqual([]);
  });

  it('guarda e volta a listar um modelo', async () => {
    await guardarModelo(modelo);
    const lista = await listarModelos();
    expect(lista).toHaveLength(1);
    expect(lista[0].nome).toBe('Jantar');
  });

  it('substitui um modelo existente em vez de duplicar, ao guardar com o mesmo id', async () => {
    await guardarModelo(modelo);
    await guardarModelo({ ...modelo, nome: 'Jantar (editado)' });
    const lista = await listarModelos();
    expect(lista).toHaveLength(1);
    expect(lista[0].nome).toBe('Jantar (editado)');
  });

  it('apaga só o modelo pedido, mantendo os outros', async () => {
    await guardarModelo(modelo);
    await guardarModelo({ ...modelo, id: 'm2', nome: 'Almoço' });
    await apagarModelo('m1');
    const lista = await listarModelos();
    expect(lista).toHaveLength(1);
    expect(lista[0].id).toBe('m2');
  });
});

describe('fotos permanentes', () => {
  it('copia a foto do caminho temporário para um sítio permanente', async () => {
    const destino = await guardarFotoPermanente('temp://foto-original.jpg');
    expect(destino).toBeDefined();
    expect(destino).toContain('fotos-contas/');
    expect(ficheirosExistentes.has(destino!)).toBe(true);
  });

  it('devolve undefined em vez de rebentar, se a cópia falhar', async () => {
    const FileSystem = require('expo-file-system/legacy');
    FileSystem.copyAsync.mockRejectedValueOnce(new Error('disco cheio'));
    const destino = await guardarFotoPermanente('temp://foto.jpg');
    expect(destino).toBeUndefined();
  });

  it('apaga o ficheiro da foto sem rebentar mesmo que já não exista', async () => {
    await expect(apagarFotoPermanente('file:///nao-existe.jpg')).resolves.not.toThrow();
  });

  it('não faz nada quando não há uri nenhum (foto nunca chegou a ser guardada)', async () => {
    await expect(apagarFotoPermanente(undefined)).resolves.not.toThrow();
  });
});

describe('contas (histórico)', () => {
  function contaComFoto(id: string, fotoUri?: string): Conta {
    return {
      id,
      nome: `Conta ${id}`,
      itens: [],
      grupos: [],
      atribuicoes: [],
      fotoUri,
    };
  }

  it('guarda e lista contas', async () => {
    await guardarConta(contaComFoto('c1'));
    const lista = await listarContas();
    expect(lista).toHaveLength(1);
  });

  it('ao apagar uma conta, apaga também a foto associada, mas não as das outras', async () => {
    const fotoC1 = await guardarFotoPermanente('temp://foto-c1.jpg');
    const fotoC2 = await guardarFotoPermanente('temp://foto-c2.jpg');
    await guardarConta(contaComFoto('c1', fotoC1));
    await guardarConta(contaComFoto('c2', fotoC2));

    await apagarConta('c1');

    const lista = await listarContas();
    expect(lista).toHaveLength(1);
    expect(lista[0].id).toBe('c2');
    expect(ficheirosExistentes.has(fotoC1!)).toBe(false);
    expect(ficheirosExistentes.has(fotoC2!)).toBe(true);
  });

  it('apagar uma conta sem foto não rebenta', async () => {
    await guardarConta(contaComFoto('c1'));
    await expect(apagarConta('c1')).resolves.not.toThrow();
  });
});