import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useIdioma } from '../i18n';

// Altura total do cabeçalho fixo, incluindo a margem de segurança do
// topo. Cada ecrã usa este valor no paddingTop do seu container, para o
// conteúdo começar sempre no mesmo sítio, sem o cabeçalho "saltar".
export const ALTURA_CABECALHO = 118;

export default function Cabecalho() {
  const { t, trocarIdioma } = useIdioma();

  return (
    <View style={styles.fixo}>
      <Image
        source={require('../../assets/branding/logo-mark.png')}
        style={styles.logoMark}
        resizeMode="contain"
      />
      <Text style={styles.nomeApp}>
        <Text style={styles.nomeAppDividir}>dividir</Text>
        <Text style={styles.nomeAppConta}>conta</Text>
      </Text>
      <View style={styles.espacador} />
      <Pressable style={styles.botaoIdioma} onPress={trocarIdioma}>
        <Text style={styles.botaoIdiomaTexto}>{t.cabecalho.trocarIdioma}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fixo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ALTURA_CABECALHO,
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    zIndex: 10,
  },
  logoMark: { width: 36, height: 36 },
  nomeApp: { fontSize: 24, fontWeight: '800' },
  nomeAppDividir: { color: '#3D2C25' },
  nomeAppConta: { color: '#E69B74' },
  espacador: { flex: 1 },
  botaoIdioma: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5d9d0',
  },
  botaoIdiomaTexto: { fontSize: 12, fontWeight: '700', color: '#3D2C25' },
});
