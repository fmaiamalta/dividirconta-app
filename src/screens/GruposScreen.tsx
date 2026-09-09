import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, Alert } from 'react-native';
import { Grupo, PALETA_CORES } from '../types';
import Cabecalho, { ALTURA_CABECALHO } from '../components/Cabecalho';
import { useIdioma } from '../i18n';

interface Props {
  // Quando definido, mostra o campo de nome no topo — é o modo "guardar
  // como modelo". Quando omitido, edita só os grupos desta conta, sem
  // pedir nome nem persistir nada (uso a partir do ecrã de itens).
  nomeInicial?: string;
  grupos: Grupo[];
  onGuardar: (nome: string | null, grupos: Grupo[]) => void;
  onCancelar: () => void;
  onApagar?: () => void;
}

export default function GruposScreen({
  nomeInicial,
  grupos,
  onGuardar,
  onCancelar,
  onApagar,
}: Props) {
  const { t } = useIdioma();
  const mostrarNome = nomeInicial !== undefined;
  const [nome, setNome] = useState(nomeInicial ?? '');
  const [lista, setLista] = useState<Grupo[]>(grupos);

  const atualizarNome = (id: string, nome: string) => {
    setLista((prev) => prev.map((g) => (g.id === id ? { ...g, nome } : g)));
  };

  const atualizarPessoas = (id: string, delta: number) => {
    setLista((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, numPessoas: Math.max(1, g.numPessoas + delta) } : g
      )
    );
  };

  const atualizarCor = (id: string, cor: string) => {
    setLista((prev) => prev.map((g) => (g.id === id ? { ...g, cor } : g)));
  };

  const adicionarGrupo = () => {
    const corUsada = new Set(lista.map((g) => g.cor));
    const corLivre = PALETA_CORES.find((c) => !corUsada.has(c)) ?? PALETA_CORES[0];
    const novoGrupo: Grupo = {
      id: `grupo-${Date.now()}`,
      nome: t.gruposEcra.grupoDefaultNome(String.fromCharCode(65 + lista.length)),
      cor: corLivre,
      numPessoas: 1,
    };
    setLista((prev) => [...prev, novoGrupo]);
  };

  const removerGrupo = (id: string) => {
    setLista((prev) => prev.filter((g) => g.id !== id));
  };

  const podeGuardar = lista.length > 0 && (!mostrarNome || nome.trim().length > 0);

  const confirmarApagar = () => {
    if (!onApagar) return;
    Alert.alert(
      t.gruposEcra.apagarContaTitulo,
      t.gruposEcra.apagarContaMsg,
      [
        { text: t.comum.cancelar, style: 'cancel' },
        { text: t.comum.apagar, style: 'destructive', onPress: onApagar },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Cabecalho />
      <Text style={styles.titulo}>{mostrarNome ? t.gruposEcra.tituloGrupos : t.gruposEcra.tituloEditar}</Text>
      <Text style={styles.subtitulo}>{t.gruposEcra.subtitulo}</Text>

      <ScrollView style={styles.lista}>
        {mostrarNome && (
          <View style={styles.cartaoNome}>
            <Text style={styles.nomeLabel}>{t.gruposEcra.nomeDestaConta}</Text>
            <TextInput
              style={styles.inputNomeConta}
              value={nome}
              onChangeText={setNome}
              placeholder={t.gruposEcra.placeholderNomeConta}
            />
          </View>
        )}

        {lista.map((g) => (
          <View key={g.id} style={styles.cartao}>
            <View style={styles.linhaTopo}>
              <View style={[styles.corBolinha, { backgroundColor: g.cor }]} />
              <TextInput
                style={styles.inputNome}
                value={g.nome}
                onChangeText={(texto) => atualizarNome(g.id, texto)}
                placeholder={t.gruposEcra.placeholderNomeGrupo}
              />
              <Pressable onPress={() => removerGrupo(g.id)} style={styles.botaoRemover}>
                <Text style={styles.botaoRemoverTexto}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.linhaCores}>
              {PALETA_CORES.map((cor) => (
                <Pressable
                  key={cor}
                  onPress={() => atualizarCor(g.id, cor)}
                  style={[
                    styles.corOpcao,
                    { backgroundColor: cor },
                    g.cor === cor && styles.corOpcaoAtiva,
                  ]}
                />
              ))}
            </View>

            <View style={styles.linhaPessoas}>
              <Text style={styles.pessoasLabel}>{t.gruposEcra.numPessoas}</Text>
              <View style={styles.stepper}>
                <Pressable style={styles.stepperBotao} onPress={() => atualizarPessoas(g.id, -1)}>
                  <Text style={styles.stepperBotaoTexto}>−</Text>
                </Pressable>
                <Text style={styles.stepperValor}>{g.numPessoas}</Text>
                <Pressable style={styles.stepperBotao} onPress={() => atualizarPessoas(g.id, 1)}>
                  <Text style={styles.stepperBotaoTexto}>+</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ))}

        <Pressable style={styles.botaoAdicionar} onPress={adicionarGrupo}>
          <Text style={styles.botaoAdicionarTexto}>{t.gruposEcra.adicionarGrupo}</Text>
        </Pressable>

        {onApagar && (
          <Pressable style={styles.botaoApagar} onPress={confirmarApagar}>
            <Text style={styles.botaoApagarTexto}>{t.gruposEcra.apagarContaBotao}</Text>
          </Pressable>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.rodape}>
        <Pressable style={styles.botaoCancelar} onPress={onCancelar}>
          <Text style={styles.botaoCancelarTexto}>{t.comum.cancelar}</Text>
        </Pressable>
        <Pressable
          style={[styles.botaoGuardar, !podeGuardar && styles.botaoDesativado]}
          disabled={!podeGuardar}
          onPress={() => onGuardar(mostrarNome ? nome.trim() : null, lista)}
        >
          <Text style={styles.botaoGuardarTexto}>{t.comum.guardar}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: ALTURA_CABECALHO, backgroundColor: '#fff' },
  titulo: { fontSize: 22, fontWeight: '700', color: '#3D2C25', paddingHorizontal: 16 },
  subtitulo: {
    fontSize: 13,
    color: '#555',
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,
  },
  lista: { flex: 1 },
  cartaoNome: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  nomeLabel: { fontSize: 13, color: '#555', marginBottom: 6 },
  inputNomeConta: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3D2C25',
    borderBottomWidth: 2,
    borderBottomColor: '#3D2C25',
    paddingVertical: 6,
  },
  cartao: {
    backgroundColor: '#f7f8fa',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  linhaTopo: { flexDirection: 'row', alignItems: 'center' },
  corBolinha: { width: 14, height: 14, borderRadius: 7, marginRight: 8 },
  inputNome: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#3D2C25',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 4,
  },
  botaoRemover: { paddingHorizontal: 10, paddingVertical: 4 },
  botaoRemoverTexto: { color: '#999', fontSize: 16 },
  linhaCores: { flexDirection: 'row', gap: 8, marginTop: 12 },
  corOpcao: { width: 24, height: 24, borderRadius: 12 },
  corOpcaoAtiva: { borderWidth: 2, borderColor: '#3D2C25' },
  linhaPessoas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  pessoasLabel: { fontSize: 13, color: '#555' },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  stepperBotao: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e5e5e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBotaoTexto: { fontSize: 18, color: '#333', fontWeight: '600' },
  stepperValor: { fontSize: 15, fontWeight: '700', color: '#3D2C25', minWidth: 28, textAlign: 'center' },
  botaoAdicionar: {
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3D2C25',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  botaoAdicionarTexto: { color: '#3D2C25', fontSize: 14, fontWeight: '600' },
  botaoApagar: {
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botaoApagarTexto: { color: '#dc2626', fontSize: 14, fontWeight: '600' },
  rodape: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
  },
  botaoCancelar: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#eee',
  },
  botaoCancelarTexto: { fontSize: 15, fontWeight: '600', color: '#333' },
  botaoGuardar: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#3D2C25',
  },
  botaoDesativado: { opacity: 0.4 },
  botaoGuardarTexto: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
