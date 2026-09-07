import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Conta, Grupo, ModeloGrupos, Item } from './src/types';
import {
  listarModelos,
  guardarModelo,
  apagarModelo,
  listarContas,
  guardarConta,
  apagarConta,
} from './src/utils/armazenamento';
import { ajustarAtribuicoesAosGrupos } from './src/utils/calculo';
import InicioScreen from './src/screens/InicioScreen';
import CapturaScreen from './src/screens/CapturaScreen';
import ItemsScreen from './src/screens/ItemsScreen';
import ResumoScreen from './src/screens/ResumoScreen';
import GruposScreen from './src/screens/GruposScreen';

type Ecra = 'inicio' | 'grupos' | 'grupos-sessao' | 'captura' | 'itens' | 'resumo';

const gruposIniciais: Grupo[] = [
  { id: 'grupo-a', nome: 'Grupo A', cor: '#E8B08C', numPessoas: 1 },
  { id: 'grupo-b', nome: 'Grupo B', cor: '#9FD8BE', numPessoas: 1 },
];

export default function App() {
  const [aCarregar, setACarregar] = useState(true);
  const [modelos, setModelos] = useState<ModeloGrupos[]>([]);
  const [modeloEmEdicao, setModeloEmEdicao] = useState<ModeloGrupos | null>(null);
  const [gruposParaNovaConta, setGruposParaNovaConta] = useState<Grupo[]>(gruposIniciais);
  const [nomeModeloParaNovaConta, setNomeModeloParaNovaConta] = useState('');
  const [contas, setContas] = useState<Conta[]>([]);
  const [conta, setConta] = useState<Conta | null>(null);
  const [ecra, setEcra] = useState<Ecra>('inicio');

  useEffect(() => {
    Promise.all([listarModelos(), listarContas()]).then(([listaModelos, listaContas]) => {
      setModelos(listaModelos);
      setContas(listaContas);
      setACarregar(false);
    });
  }, []);

  // Sempre que a conta muda durante a sessão, guarda-a logo, para não se
  // perder se a app fechar a meio.
  const atualizarConta = (novaConta: Conta) => {
    setConta(novaConta);
    guardarConta(novaConta).then(setContas);
  };

  const escolherModelo = (modelo: ModeloGrupos) => {
    setGruposParaNovaConta(modelo.grupos);
    setNomeModeloParaNovaConta(modelo.nome);
    setEcra('captura');
  };

  const editarModelo = (modelo: ModeloGrupos) => {
    setModeloEmEdicao(modelo);
    setEcra('grupos');
  };

  const novoModelo = () => {
    setModeloEmEdicao(null);
    setEcra('grupos');
  };

  const apagarModeloGuardado = async (modelo: ModeloGrupos) => {
    const novos = await apagarModelo(modelo.id);
    setModelos(novos);
  };

  const guardarModeloDoFormulario = async (nome: string | null, grupos: Grupo[]) => {
    const modelo: ModeloGrupos = {
      id: modeloEmEdicao?.id ?? `modelo-${Date.now()}`,
      nome: nome ?? 'Sem nome',
      grupos,
    };
    const novos = await guardarModelo(modelo);
    setModelos(novos);
    setEcra('inicio');
  };

  const nomeParaNovaConta = nomeModeloParaNovaConta
    ? `Nova conta de "${nomeModeloParaNovaConta}"`
    : 'Nova conta';

  const iniciarComItens = (itens: Item[], fotoUri?: string) => {
    const novaConta: Conta = {
      id: `conta-${Date.now()}`,
      nome: nomeParaNovaConta,
      itens,
      grupos: gruposParaNovaConta,
      atribuicoes: [],
      fotoUri,
      criadaEm: Date.now(),
    };
    setConta(novaConta);
    guardarConta(novaConta).then(setContas);
    setEcra('itens');
  };

  const abrirConta = (contaGuardada: Conta) => {
    setConta(contaGuardada);
    setEcra('itens');
  };

  const apagarContaGuardada = async (contaAlvo: Conta) => {
    const novas = await apagarConta(contaAlvo.id);
    setContas(novas);
    if (conta?.id === contaAlvo.id) {
      setConta(null);
      setEcra('inicio');
    }
  };

  if (aCarregar) {
    return (
      <View style={styles.aCarregar}>
        <ActivityIndicator size="large" color="#3D2C25" />
      </View>
    );
  }

  return (
    <>
      {ecra === 'inicio' && (
        <InicioScreen
          modelos={modelos}
          contas={contas}
          onEscolherModelo={escolherModelo}
          onEditarModelo={editarModelo}
          onApagarModelo={apagarModeloGuardado}
          onNovoModelo={novoModelo}
          onAbrirConta={abrirConta}
          onApagarConta={apagarContaGuardada}
        />
      )}

      {ecra === 'grupos' && (
        <GruposScreen
          nomeInicial={modeloEmEdicao?.nome ?? ''}
          grupos={modeloEmEdicao?.grupos ?? gruposIniciais}
          onGuardar={guardarModeloDoFormulario}
          onCancelar={() => setEcra('inicio')}
          onApagar={
            modeloEmEdicao
              ? () => {
                  apagarModeloGuardado(modeloEmEdicao);
                  setEcra('inicio');
                }
              : undefined
          }
        />
      )}

      {ecra === 'grupos-sessao' && conta && (
        <GruposScreen
          grupos={conta.grupos}
          onGuardar={(_nome, grupos) => {
            const atribuicoesAjustadas = ajustarAtribuicoesAosGrupos(conta.atribuicoes, grupos);
            atualizarConta({ ...conta, grupos, atribuicoes: atribuicoesAjustadas });
            setEcra('itens');
          }}
          onCancelar={() => setEcra('itens')}
        />
      )}

      {ecra === 'captura' && (
        <CapturaScreen
          titulo={nomeParaNovaConta}
          onItensExtraidos={iniciarComItens}
          onVoltar={() => setEcra('inicio')}
        />
      )}

      {ecra === 'itens' && conta && (
        <ItemsScreen
          conta={conta}
          onAtualizarConta={atualizarConta}
          onVerResumo={() => setEcra('resumo')}
          onEditarGrupos={() => setEcra('grupos-sessao')}
          onRecomecar={() => {
            apagarContaGuardada(conta);
          }}
          onVoltarInicio={() => setEcra('inicio')}
        />
      )}

      {ecra === 'resumo' && conta && (
        <ResumoScreen
          conta={conta}
          onVoltar={() => setEcra('itens')}
          onInicio={() => setEcra('inicio')}
        />
      )}

      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  aCarregar: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
});
