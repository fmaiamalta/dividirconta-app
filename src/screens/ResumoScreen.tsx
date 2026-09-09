import React from 'react';
import { View, Text, ScrollView, Pressable, Share, StyleSheet } from 'react-native';
import { Conta } from '../types';
import { calcularTotais, getTotalConta } from '../utils/calculo';
import { gerarTextoResumo } from '../utils/partilha';
import Cabecalho, { ALTURA_CABECALHO } from '../components/Cabecalho';
import { useIdioma, nomeExibicaoConta } from '../i18n';

interface Props {
  conta: Conta;
  onVoltar: () => void;
  onInicio: () => void;
}

export default function ResumoScreen({ conta, onVoltar, onInicio }: Props) {
  const { t } = useIdioma();
  const totais = calcularTotais(conta);
  const totalConta = getTotalConta(conta);
  const totalCalculado = totais.reduce((s, grupo) => s + grupo.total, 0);
  const diferenca = totalConta - totalCalculado;

  const partilhar = () => {
    Share.share({ message: gerarTextoResumo(conta, totais, t) });
  };

  return (
    <View style={styles.container}>
      <Cabecalho />
      <Text style={styles.titulo}>{nomeExibicaoConta(conta, t)}</Text>
      <Text style={styles.subtitulo}>{t.resumo.totalConta(totalConta.toFixed(2))}</Text>

      <ScrollView style={styles.lista}>
        {totais.map((grupo) => (
          <View key={grupo.grupoId} style={[styles.cartao, { borderLeftColor: grupo.cor }]}>
            <View style={styles.cabecalho}>
              <View style={[styles.corBolinha, { backgroundColor: grupo.cor }]} />
              <Text style={styles.nomeGrupo}>{grupo.nome}</Text>
            </View>
            <View style={styles.linhaDetalhe}>
              <Text style={styles.detalheLabel}>{t.itens.comida}</Text>
              <Text style={styles.detalheValor}>{grupo.totalComida.toFixed(2)} €</Text>
            </View>
            <View style={styles.linhaDetalhe}>
              <Text style={styles.detalheLabel}>{t.itens.bebida}</Text>
              <Text style={styles.detalheValor}>{grupo.totalBebida.toFixed(2)} €</Text>
            </View>
            {grupo.totalOutro > 0 && (
              <View style={styles.linhaDetalhe}>
                <Text style={styles.detalheLabel}>{t.itens.outro}</Text>
                <Text style={styles.detalheValor}>{grupo.totalOutro.toFixed(2)} €</Text>
              </View>
            )}
            <View style={styles.linhaTotal}>
              <Text style={styles.totalLabel}>{t.resumo.totalAPagar}</Text>
              <Text style={[styles.totalValor, { color: grupo.cor }]}>{grupo.total.toFixed(2)} €</Text>
            </View>
          </View>
        ))}

        {Math.abs(diferenca) > 0.01 && (
          <Text style={styles.aviso}>{t.resumo.avisoNaoAtribuido(diferenca.toFixed(2))}</Text>
        )}
      </ScrollView>

      <Pressable style={styles.botaoPartilhar} onPress={partilhar}>
        <Text style={styles.botaoPartilharTexto}>{t.resumo.partilharResumo}</Text>
      </Pressable>

      <View style={styles.linhaBotoes}>
        <Pressable style={[styles.botaoVoltar, styles.botaoMetade]} onPress={onVoltar}>
          <Text style={styles.botaoVoltarTexto}>{t.resumo.voltarAosItens}</Text>
        </Pressable>
        <Pressable style={[styles.botaoVoltar, styles.botaoMetade]} onPress={onInicio}>
          <Text style={styles.botaoVoltarTexto}>{t.resumo.inicio}</Text>
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
