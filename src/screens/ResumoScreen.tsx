import React from 'react';
import { View, Text, ScrollView, Pressable, Share, StyleSheet } from 'react-native';
import { Conta } from '../types';
import { calcularTotais, getTotalConta } from '../utils/calculo';
import { gerarTextoResumo } from '../utils/partilha';
import Cabecalho, { ALTURA_CABECALHO } from '../components/Cabecalho';

interface Props {
  conta: Conta;
  onVoltar: () => void;
  onInicio: () => void;
}

export default function ResumoScreen({ conta, onVoltar, onInicio }: Props) {
  const totais = calcularTotais(conta);
  const totalConta = getTotalConta(conta);
  const totalCalculado = totais.reduce((s, t) => s + t.total, 0);
  const diferenca = totalConta - totalCalculado;

  const partilhar = () => {
    Share.share({ message: gerarTextoResumo(conta, totais) });
  };

  return (
    <View style={styles.container}>
      <Cabecalho />
      <Text style={styles.titulo}>{conta.nome}</Text>
      <Text style={styles.subtitulo}>Total da conta: {totalConta.toFixed(2)} €</Text>

      <ScrollView style={styles.lista}>
        {totais.map((t) => (
          <View key={t.grupoId} style={[styles.cartao, { borderLeftColor: t.cor }]}>
            <View style={styles.cabecalho}>
              <View style={[styles.corBolinha, { backgroundColor: t.cor }]} />
              <Text style={styles.nomeGrupo}>{t.nome}</Text>
            </View>
            <View style={styles.linhaDetalhe}>
              <Text style={styles.detalheLabel}>Comida</Text>
              <Text style={styles.detalheValor}>{t.totalComida.toFixed(2)} €</Text>
            </View>
            <View style={styles.linhaDetalhe}>
              <Text style={styles.detalheLabel}>Bebida</Text>
              <Text style={styles.detalheValor}>{t.totalBebida.toFixed(2)} €</Text>
            </View>
            {t.totalOutro > 0 && (
              <View style={styles.linhaDetalhe}>
                <Text style={styles.detalheLabel}>Outro</Text>
                <Text style={styles.detalheValor}>{t.totalOutro.toFixed(2)} €</Text>
              </View>
            )}
            <View style={styles.linhaTotal}>
              <Text style={styles.totalLabel}>Total a pagar</Text>
              <Text style={[styles.totalValor, { color: t.cor }]}>{t.total.toFixed(2)} €</Text>
            </View>
          </View>
        ))}

        {Math.abs(diferenca) > 0.01 && (
          <Text style={styles.aviso}>
            Atenção: {diferenca.toFixed(2)} € da conta ainda não está atribuído a ninguém.
          </Text>
        )}
      </ScrollView>

      <Pressable style={styles.botaoPartilhar} onPress={partilhar}>
        <Text style={styles.botaoPartilharTexto}>Partilhar resumo</Text>
      </Pressable>

      <View style={styles.linhaBotoes}>
        <Pressable style={[styles.botaoVoltar, styles.botaoMetade]} onPress={onVoltar}>
          <Text style={styles.botaoVoltarTexto}>Voltar aos itens</Text>
        </Pressable>
        <Pressable style={[styles.botaoVoltar, styles.botaoMetade]} onPress={onInicio}>
          <Text style={styles.botaoVoltarTexto}>Início</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: ALTURA_CABECALHO, paddingHorizontal: 16, backgroundColor: '#fff' },
  titulo: { fontSize: 22, fontWeight: '700', color: '#3D2C25' },
  subtitulo: { fontSize: 14, color: '#555', marginTop: 4, marginBottom: 16 },
  lista: { flex: 1 },
  cartao: {
    backgroundColor: '#f7f8fa',
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 14,
    marginBottom: 12,
  },
  cabecalho: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  corBolinha: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  nomeGrupo: { fontSize: 16, fontWeight: '700', color: '#3D2C25' },
  linhaDetalhe: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  detalheLabel: { fontSize: 13, color: '#666' },
  detalheValor: { fontSize: 13, color: '#333' },
  linhaTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  totalLabel: { fontSize: 14, fontWeight: '700', color: '#3D2C25' },
  totalValor: { fontSize: 16, fontWeight: '700' },
  aviso: {
    fontSize: 13,
    color: '#b45309',
    backgroundColor: '#fff8e1',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  botaoPartilhar: {
    backgroundColor: '#3D2C25',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  botaoPartilharTexto: { fontSize: 15, fontWeight: '700', color: '#fff' },
  linhaBotoes: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  botaoMetade: { flex: 1, marginBottom: 0 },
  botaoVoltar: {
    backgroundColor: '#eee',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  botaoVoltarTexto: { fontSize: 15, fontWeight: '600', color: '#333' },
});
