import React from 'react';
import { View, Text, Pressable, ScrollView, Image, StyleSheet, Alert } from 'react-native';
import { ModeloGrupos, Conta } from '../types';
import { getItensIncompletos, calcularTotais } from '../utils/calculo';
import Cabecalho, { ALTURA_CABECALHO } from '../components/Cabecalho';

interface Props {
  modelos: ModeloGrupos[];
  contas: Conta[];
  onEscolherModelo: (modelo: ModeloGrupos) => void;
  onEditarModelo: (modelo: ModeloGrupos) => void;
  onApagarModelo: (modelo: ModeloGrupos) => void;
  onNovoModelo: () => void;
  onAbrirConta: (conta: Conta) => void;
  onApagarConta: (conta: Conta) => void;
}

function formatarData(timestamp?: number): string {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
}

export default function InicioScreen({
  modelos,
  contas,
  onEscolherModelo,
  onEditarModelo,
  onApagarModelo,
  onNovoModelo,
  onAbrirConta,
  onApagarConta,
}: Props) {
  const contasOrdenadas = [...contas].sort((a, b) => (b.criadaEm ?? 0) - (a.criadaEm ?? 0));

  const confirmarApagarModelo = (modelo: ModeloGrupos) => {
    Alert.alert(
      `Apagar "${modelo.nome}"?`,
      'Os grupos guardados aqui desaparecem. Não podes desfazer isto.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: () => onApagarModelo(modelo) },
      ]
    );
  };

  const confirmarApagarConta = (conta: Conta) => {
    Alert.alert(
      `Apagar "${conta.nome}"?`,
      'A foto e tudo o que já atribuíste nesta conta desaparecem. Não podes desfazer isto.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: () => onApagarConta(conta) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Cabecalho />

      <ScrollView style={styles.lista}>
        {contasOrdenadas.length > 0 && (
          <>
            <Text style={styles.secaoTitulo}>As tuas contas</Text>
            {contasOrdenadas.map((conta) => {
              const incompletos = getItensIncompletos(conta);
              const concluida = incompletos.length === 0;
              const total = concluida
                ? calcularTotais(conta).reduce((s, t) => s + t.total, 0)
                : null;

              return (
                <Pressable key={conta.id} style={styles.cartaoConta} onPress={() => onAbrirConta(conta)}>
                  {conta.fotoUri ? (
                    <Image source={{ uri: conta.fotoUri }} style={styles.miniatura} />
                  ) : (
                    <View style={styles.miniaturaVazia} />
                  )}
                  <View style={styles.contaInfo}>
                    <Text style={styles.nomeConta}>{conta.nome}</Text>
                    <Text style={styles.detalheConta}>
                      {formatarData(conta.criadaEm)} · {conta.itens.length} itens
                    </Text>
                    <Text style={concluida ? styles.estadoConcluido : styles.estadoPendente}>
                      {concluida ? `Concluída · ${total!.toFixed(2)} €` : 'Por terminar'}
                    </Text>
                  </View>
                  <Pressable
                    style={styles.botaoApagarConta}
                    onPress={(e) => {
                      e.stopPropagation();
                      confirmarApagarConta(conta);
                    }}
                  >
                    <Text style={styles.botaoApagarContaTexto}>Apagar</Text>
                  </Pressable>
                </Pressable>
              );
            })}
          </>
        )}

        <Text style={styles.secaoTitulo}>Grupos guardados</Text>
        {modelos.length === 0 && (
          <Text style={styles.subtitulo}>Ainda não tens nenhum grupo guardado.</Text>
        )}
        {modelos.map((modelo) => (
          <Pressable key={modelo.id} style={styles.cartao} onPress={() => onEscolherModelo(modelo)}>
            <View style={styles.cartaoInfo}>
              <Text style={styles.nomeModelo}>{modelo.nome}</Text>
              <View style={styles.corzinhas}>
                {modelo.grupos.map((g) => (
                  <View key={g.id} style={[styles.corBolinha, { backgroundColor: g.cor }]} />
                ))}
                <Text style={styles.numGrupos}>
                  {modelo.grupos.length} {modelo.grupos.length === 1 ? 'grupo' : 'grupos'}
                </Text>
              </View>
            </View>
            <View style={styles.cartaoAcoes}>
              <Pressable
                style={styles.botaoAcao}
                onPress={(e) => {
                  e.stopPropagation();
                  onEditarModelo(modelo);
                }}
              >
                <Text style={styles.botaoAcaoTexto}>Editar</Text>
              </Pressable>
              <Pressable
                style={styles.botaoAcao}
                onPress={(e) => {
                  e.stopPropagation();
                  confirmarApagarModelo(modelo);
                }}
              >
                <Text style={styles.botaoAcaoTextoApagar}>Apagar</Text>
              </Pressable>
            </View>
          </Pressable>
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>

      <Pressable style={styles.botaoSecundario} onPress={onNovoModelo}>
        <Text style={styles.botaoSecundarioTexto}>+ Nova conta</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: ALTURA_CABECALHO, paddingHorizontal: 20, backgroundColor: '#fff' },
  subtitulo: { fontSize: 14, color: '#555', marginBottom: 12 },
  lista: { flex: 1 },
  secaoTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 8,
  },
  cartaoConta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f8fa',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  miniatura: { width: 48, height: 48, borderRadius: 8, marginRight: 12, backgroundColor: '#eee' },
  miniaturaVazia: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  contaInfo: { flex: 1 },
  nomeConta: { fontSize: 15, fontWeight: '700', color: '#3D2C25' },
  detalheConta: { fontSize: 12, color: '#777', marginTop: 2 },
  estadoConcluido: { fontSize: 12, color: '#2f7a4f', fontWeight: '600', marginTop: 2 },
  estadoPendente: { fontSize: 12, color: '#b45309', fontWeight: '600', marginTop: 2 },
  botaoApagarConta: { paddingHorizontal: 8, paddingVertical: 6 },
  botaoApagarContaTexto: { fontSize: 12, fontWeight: '600', color: '#dc2626' },
  cartao: {
    backgroundColor: '#f7f8fa',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  cartaoInfo: { marginBottom: 10 },
  nomeModelo: { fontSize: 16, fontWeight: '700', color: '#3D2C25', marginBottom: 6 },
  corzinhas: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  corBolinha: { width: 10, height: 10, borderRadius: 5 },
  numGrupos: { fontSize: 12, color: '#666', marginLeft: 6 },
  cartaoAcoes: { flexDirection: 'row', gap: 16, borderTopWidth: 1, borderTopColor: '#e5e5e5', paddingTop: 10 },
  botaoAcao: { paddingVertical: 4 },
  botaoAcaoTexto: { fontSize: 13, fontWeight: '600', color: '#3D2C25' },
  botaoAcaoTextoApagar: { fontSize: 13, fontWeight: '600', color: '#dc2626' },
  botaoSecundario: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3D2C25',
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  botaoSecundarioTexto: { color: '#3D2C25', fontSize: 14, fontWeight: '700' },
});
