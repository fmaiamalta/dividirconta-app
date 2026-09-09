import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Item, Grupo } from '../types';
import { useIdioma } from '../i18n';

interface Props {
  item: Item;
  selecionado: boolean;
  gruposAtribuidos: Grupo[];
  pessoasEmFalta: number;
  onToggleSelecionado: () => void;
  onPressDividir?: () => void;
}

export default function ItemRow({
  item,
  selecionado,
  gruposAtribuidos,
  pessoasEmFalta,
  onToggleSelecionado,
  onPressDividir,
}: Props) {
  const { t } = useIdioma();
  const naoAtribuido = gruposAtribuidos.length === 0;
  const incompleto = naoAtribuido || pessoasEmFalta > 0;
  const valorTotal = item.preco * item.quantidade;

  return (
    <Pressable
      onPress={onToggleSelecionado}
      style={[
        styles.linha,
        selecionado && styles.linhaSelecionada,
        incompleto && styles.linhaNaoAtribuida,
      ]}
    >
      <View style={styles.checkbox}>
        {selecionado && <View style={styles.checkboxMarcado} />}
      </View>

      <View style={styles.info}>
        <Text style={styles.nome}>
          {item.quantidade > 1 ? `${item.quantidade}x ` : ''}
          {item.nome}
        </Text>
        {gruposAtribuidos.length > 0 ? (
          <View style={styles.etiquetas}>
            {gruposAtribuidos.map((g) => (
              <View key={g.id} style={styles.etiqueta}>
                <View style={[styles.corBolinha, { backgroundColor: g.cor }]} />
                <Text style={styles.etiquetaTexto}>{g.nome}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.etiquetaAlerta}>{t.itemRow.porAtribuir}</Text>
        )}
        {!naoAtribuido && pessoasEmFalta > 0 && (
          <Text style={styles.etiquetaAlerta}>{t.itemRow.faltamDe(pessoasEmFalta, item.quantidade)}</Text>
        )}
      </View>

      <Text style={styles.preco}>{valorTotal.toFixed(2)} €</Text>

      {onPressDividir && (
        <Pressable style={styles.botaoDividir} onPress={onPressDividir}>
          <Text style={styles.botaoDividirTexto}>{t.itemRow.dividir}</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  linhaSelecionada: {
    backgroundColor: '#FBEAE0',
  },
  linhaNaoAtribuida: {
    backgroundColor: '#fff8e1',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#888',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxMarcado: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: '#3D2C25',
  },
  info: {
    flex: 1,
  },
  nome: {
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
  },
  etiquetas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  etiqueta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  corBolinha: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  etiquetaTexto: {
    fontSize: 12,
    color: '#555',
  },
  etiquetaAlerta: {
    fontSize: 12,
    color: '#b45309',
    marginTop: 2,
  },
  preco: {
    fontSize: 14,
    color: '#333',
    marginRight: 8,
    minWidth: 55,
    textAlign: 'right',
  },
  botaoDividir: {
    backgroundColor: '#3D2C25',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  botaoDividirTexto: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
