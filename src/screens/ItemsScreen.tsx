import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { Conta, Item } from '../types';
import ItemRow from '../components/ItemRow';
import ModalDividir from '../components/ModalDividir';
import Cabecalho, { ALTURA_CABECALHO } from '../components/Cabecalho';
import {
  getGruposDaAtribuicao,
  getPessoasEmFalta,
  getItensIncompletos,
  getItensIncompletosPorCategoria,
} from '../utils/calculo';
import { useIdioma, nomeExibicaoConta } from '../i18n';

interface Props {
  conta: Conta;
  onAtualizarConta: (conta: Conta) => void;
  onVerResumo: () => void;
  onEditarGrupos: () => void;
  onRecomecar: () => void;
  onVoltarInicio: () => void;
}

export default function ItemsScreen({
  conta,
  onAtualizarConta,
  onVerResumo,
  onEditarGrupos,
  onRecomecar,
  onVoltarInicio,
}: Props) {
  const { t } = useIdioma();
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [itemParaDividir, setItemParaDividir] = useState<Item | null>(null);

  const comida = conta.itens.filter((i) => i.categoria === 'comida');
  const bebida = conta.itens.filter((i) => i.categoria === 'bebida');
  const outro = conta.itens.filter((i) => i.categoria === 'outro');
  const itensIncompletos = getItensIncompletos(conta);
  const incompletosPorCategoria = getItensIncompletosPorCategoria(conta);

  // Descreve exatamente o que falta em cada item, para o aviso ser claro
  // em vez de dizer só "faltam 2 itens" sem contexto.
  const descreverFalta = (item: Item): string => {
    const semAtribuicao = !conta.atribuicoes.some((a) => a.itemId === item.id);
    if (semAtribuicao) return t.itens.semAtribuicao(item.nome);
    const faltam = getPessoasEmFalta(conta, item);
    return t.itens.faltamPessoas(item.nome, faltam, item.quantidade);
  };

  const tentarVerResumo = () => {
    if (itensIncompletos.length > 0) {
      Alert.alert(
        t.itens.aindaFaltaAtribuirTitulo,
        itensIncompletos.map(descreverFalta).join('\n\n')
      );
      return;
    }
    onVerResumo();
  };

  const confirmarRecomecar = () => {
    Alert.alert(
      t.itens.recomecarTitulo,
      t.itens.recomecarMsg,
      [
        { text: t.comum.cancelar, style: 'cancel' },
        { text: t.itens.recomecar, style: 'destructive', onPress: onRecomecar },
      ]
    );
  };

  const toggleSelecionado = (itemId: string) => {
    setSelecionados((prev) =>
      prev.includes(itemId) ? prev.filter((x) => x !== itemId) : [...prev, itemId]
    );
  };

  // Atribui todos os itens selecionados a um único grupo: significa que
  // esse grupo levou tudo, sem precisar de contar pessoas (por isso
  // exclusivo: true).
  const atribuirSelecionadosA = (grupoId: string) => {
    const novasAtribuicoes = conta.atribuicoes.filter(
      (a) => !selecionados.includes(a.itemId)
    );
    for (const itemId of selecionados) {
      novasAtribuicoes.push({
        itemId,
        partes: [{ grupoId, quantidade: 1 }],
        exclusivo: true,
      });
    }
    onAtualizarConta({ ...conta, atribuicoes: novasAtribuicoes });
    setSelecionados([]);
  };

  // Confirma a divisão de um item entre pessoas específicas de vários
  // grupos (aqui sim interessa contar pessoas, por isso exclusivo: false).
  const confirmarDivisao = (partes: { grupoId: string; quantidade: number }[]) => {
    if (!itemParaDividir) return;
    const novasAtribuicoes = conta.atribuicoes.filter(
      (a) => a.itemId !== itemParaDividir.id
    );
    novasAtribuicoes.push({ itemId: itemParaDividir.id, partes, exclusivo: false });
    onAtualizarConta({ ...conta, atribuicoes: novasAtribuicoes });
    setItemParaDividir(null);
  };

  const partesIniciaisModal = itemParaDividir
    ? conta.atribuicoes.find((a) => a.itemId === itemParaDividir.id)?.partes ?? []
    : [];

  return (
    <View style={styles.container}>
      <Cabecalho />
      <Pressable style={styles.botaoVoltar} onPress={onVoltarInicio}>
        <Text style={styles.botaoVoltarTexto}>{t.comum.voltar}</Text>
      </Pressable>
      <View style={styles.cabecalhoTitulo}>
        <Text style={styles.titulo} numberOfLines={1} ellipsizeMode="tail">
          {nomeExibicaoConta(conta, t)}
        </Text>
        <View style={styles.botoesCabecalho}>
          <Pressable onPress={confirmarRecomecar} style={styles.botaoCabecalho}>
            <Text style={styles.botaoCabecalhoTexto}>{t.itens.recomecar}</Text>
          </Pressable>
          <Pressable onPress={onEditarGrupos} style={styles.botaoCabecalho}>
            <Text style={styles.botaoCabecalhoTexto}>{t.itens.grupos}</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.lista}>
        <View style={styles.secaoCabecalho}>
          <Text style={styles.secaoTitulo}>{t.itens.comida}</Text>
          {incompletosPorCategoria.comida.length > 0 && (
            <Text style={styles.avisoSecao}>{t.itens.porAtribuir(incompletosPorCategoria.comida.length)}</Text>
          )}
        </View>
        {comida.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            selecionado={selecionados.includes(item.id)}
            gruposAtribuidos={getGruposDaAtribuicao(conta, item.id)}
            pessoasEmFalta={getPessoasEmFalta(conta, item)}
            onToggleSelecionado={() => toggleSelecionado(item.id)}
            onPressDividir={() => setItemParaDividir(item)}
          />
        ))}

        <View style={styles.secaoCabecalho}>
          <Text style={styles.secaoTitulo}>{t.itens.bebida}</Text>
          {incompletosPorCategoria.bebida.length > 0 && (
            <Text style={styles.avisoSecao}>{t.itens.porResolver(incompletosPorCategoria.bebida.length)}</Text>
          )}
        </View>
        {bebida.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            selecionado={selecionados.includes(item.id)}
            gruposAtribuidos={getGruposDaAtribuicao(conta, item.id)}
            pessoasEmFalta={getPessoasEmFalta(conta, item)}
            onToggleSelecionado={() => toggleSelecionado(item.id)}
            onPressDividir={() => setItemParaDividir(item)}
          />
        ))}

        {outro.length > 0 && (
          <>
            <View style={styles.secaoCabecalho}>
              <Text style={styles.secaoTitulo}>{t.itens.outro}</Text>
              {incompletosPorCategoria.outro.length > 0 && (
                <Text style={styles.avisoSecao}>{t.itens.porAtribuir(incompletosPorCategoria.outro.length)}</Text>
              )}
            </View>
            {outro.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                selecionado={selecionados.includes(item.id)}
                gruposAtribuidos={getGruposDaAtribuicao(conta, item.id)}
                pessoasEmFalta={getPessoasEmFalta(conta, item)}
                onToggleSelecionado={() => toggleSelecionado(item.id)}
                onPressDividir={() => setItemParaDividir(item)}
              />
            ))}
          </>
        )}

        <View style={{ height: 140 }} />
      </ScrollView>

      {selecionados.length > 0 && (
        <View style={styles.barraAtribuicao}>
          <Text style={styles.barraTexto}>{t.itens.itensSelecionados(selecionados.length)}</Text>
          <View style={styles.botoesGrupos}>
            {conta.grupos.map((g) => (
              <Pressable
                key={g.id}
                style={[styles.botaoGrupo, { backgroundColor: g.cor }]}
                onPress={() => atribuirSelecionadosA(g.id)}
              >
                <Text style={styles.botaoGrupoTexto}>{g.nome} ({g.numPessoas})</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      <Pressable
        style={[styles.botaoResumo, itensIncompletos.length > 0 && styles.botaoResumoDesativado]}
        onPress={tentarVerResumo}
      >
        <Text style={styles.botaoResumoTexto}>
          {itensIncompletos.length > 0
            ? t.itens.faltaAtribuir(itensIncompletos.length)
            : t.itens.verResumo}
        </Text>
      </Pressable>

      <ModalDividir
        visivel={itemParaDividir !== null}
        item={itemParaDividir}
        grupos={conta.grupos}
        partesIniciais={partesIniciaisModal}
        onConfirmar={confirmarDivisao}
        onCancelar={() => setItemParaDividir(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: ALTURA_CABECALHO, backgroundColor: '#fff' },
  botaoVoltar: { alignSelf: 'flex-start', paddingHorizontal: 16, marginBottom: 4 },
  botaoVoltarTexto: { color: '#3D2C25', fontSize: 15, fontWeight: '600' },
  cabecalhoTitulo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  titulo: { fontSize: 22, fontWeight: '700', color: '#3D2C25', flexShrink: 1 },
  botoesCabecalho: { flexDirection: 'row', gap: 8, flexShrink: 0 },
  botaoCabecalho: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  botaoCabecalhoTexto: { fontSize: 13, fontWeight: '600', color: '#333' },
  lista: { flex: 1, marginTop: 12 },
  secaoCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
  },
  secaoTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
  },
  avisoSecao: {
    fontSize: 12,
    fontWeight: '700',
    color: '#b45309',
  },
  barraAtribuicao: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    backgroundColor: '#3D2C25',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  barraTexto: { color: '#fff', fontSize: 12, marginBottom: 8 },
  botoesGrupos: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  botaoGrupo: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  botaoGrupoTexto: { color: '#fff', fontSize: 13, fontWeight: '600' },
  botaoResumo: {
    backgroundColor: '#3D2C25',
    paddingVertical: 16,
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  botaoResumoDesativado: {
    backgroundColor: '#999',
  },
  botaoResumoTexto: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
