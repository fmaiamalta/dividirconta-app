import React from 'react';
import { View, Text, Pressable, ScrollView, Image, StyleSheet, Alert } from 'react-native';
import { ModeloGrupos, Conta } from '../types';
import { getItensIncompletos, calcularTotais } from '../utils/calculo';
import Cabecalho, { ALTURA_CABECALHO } from '../components/Cabecalho';
import { useIdioma, nomeExibicaoConta } from '../i18n';

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

function formatarData(timestamp: number | undefined, locale: string): string {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleDateString(locale, { day: '2-digit', month: '2-digit' });
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
  const { t, localeData } = useIdioma();
  const contasOrdenadas = [...contas].sort((a, b) => (b.criadaEm ?? 0) - (a.criadaEm ?? 0));

  const confirmarApagarModelo = (modelo: ModeloGrupos) => {
    Alert.alert(
      t.inicio.confirmarApagarModeloTitulo(modelo.nome),
      t.inicio.confirmarApagarModeloMsg,
      [
        { text: t.comum.cancelar, style: 'cancel' },
        { text: t.comum.apagar, style: 'destructive', onPress: () => onApagarModelo(modelo) },
      ]
    );
  };

  const confirmarApagarConta = (conta: Conta) => {
    Alert.alert(
      t.inicio.confirmarApagarContaTitulo(nomeExibicaoConta(conta, t)),
      t.inicio.confirmarApagarContaMsg,
      [
        { text: t.comum.cancelar, style: 'cancel' },
        { text: t.comum.apagar, style: 'destructive', onPress: () => onApagarConta(conta) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Cabecalho />

      <ScrollView style={styles.lista}>
        {contasOrdenadas.length > 0 && (
          <>
            <Text style={styles.secaoTitulo}>{t.inicio.asTuasContas}</Text>
            {contasOrdenadas.map((conta) => {
              const incompletos = getItensIncompletos(conta);
              const concluida = incompletos.length === 0;
              const total = concluida
                ? calcularTotais(conta).reduce((s, grupo) => s + grupo.total, 0)
                : null;

              return (
                <Pressable key={conta.id} style={styles.cartaoConta} onPress={() => onAbrirConta(conta)}>
                  {conta.fotoUri ? (
                    <Image source={{ uri: conta.fotoUri }} style={styles.miniatura} />
                  ) : (
                    <View style={styles.miniaturaVazia} />
                  )}
                  <View style={styles.contaInfo}>
                    <Text style={styles.nomeConta} numberOfLines={1} ellipsizeMode="tail">
                      {nomeExibicaoConta(conta, t)}
                    </Text>
                    <Text style={styles.detalheConta}>
                      {formatarData(conta.criadaEm, localeData)} · {t.inicio.numItens(conta.itens.length)}
                    </Text>
                    <Text style={concluida ? styles.estadoConcluido : styles.estadoPendente}>
                      {concluida ? t.inicio.contaConcluida(total!.toFixed(2)) : t.inicio.contaPendente}
                    </Text>
                  </View>
                  <Pressable
                    style={styles.botaoApagarConta}
                    onPress={(e) => {
                      e.stopPropagation();
                      confirmarApagarConta(conta);
                    }}
                  >
                    <Text style={styles.botaoApagarContaTexto}>{t.comum.apagar}</Text>
                  </Pressable>
                </Pressable>
              );
            })}
          </>
        )}

        <Text style={styles.secaoTitulo}>{t.inicio.gruposGuardados}</Text>
        {modelos.length === 0 && (
          <Text style={styles.subtitulo}>{t.inicio.semGrupos}</Text>
        )}
        {modelos.map((modelo) => (
          <Pressable key={modelo.id} style={styles.cartao} onPress={() => onEscolherModelo(modelo)}>
            <View style={styles.cartaoInfo}>
              <Text style={styles.nomeModelo}>{modelo.nome}</Text>
              <View style={styles.corzinhas}>
                {modelo.grupos.map((g) => (
                  <View key={g.id} style={[styles.corBolinha, { backgroundColor: g.cor }]} />
                ))}
                <Text style={styles.numGrupos}>{t.inicio.numGrupos(modelo.grupos.length)}</Text>
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
                <Text style={styles.botaoAcaoTexto}>{t.comum.editar}</Text>
              </Pressable>
              <Pressable
                style={styles.botaoAcao}
                onPress={(e) => {
                  e.stopPropagation();
                  confirmarApagarModelo(modelo);
                }}
              >
                <Text style={styles.botaoAcaoTextoApagar}>{t.comum.apagar}</Text>
              </Pressable>
            </View>
          </Pressable>
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>

      <Pressable style={styles.botaoSecundario} onPress={onNovoModelo}>
        <Text style={styles.botaoSecundarioTexto}>{t.inicio.novaConta}</Text>
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
