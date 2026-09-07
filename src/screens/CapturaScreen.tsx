import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Item } from '../types';
import { analisarConta } from '../utils/analiseFoto';
import { guardarFotoPermanente, apagarFotoPermanente } from '../utils/armazenamento';
import Cabecalho, { ALTURA_CABECALHO } from '../components/Cabecalho';

interface Props {
  titulo: string;
  onItensExtraidos: (itens: Item[], fotoUri?: string) => void;
  onVoltar: () => void;
}

export default function CapturaScreen({ titulo, onItensExtraidos, onVoltar }: Props) {
  const [uriFoto, setUriFoto] = useState<string | null>(null);
  const [uriFotoPersistida, setUriFotoPersistida] = useState<string | undefined>(undefined);
  const [aProcessar, setAProcessar] = useState(false);

  const escolherFoto = async (origem: 'camara' | 'galeria') => {
    const permissao =
      origem === 'camara'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissao.granted) {
      Alert.alert(
        'Permissão necessária',
        origem === 'camara'
          ? 'Precisas de dar acesso à câmara para tirar a foto da conta.'
          : 'Precisas de dar acesso às fotos para escolher a imagem da conta.'
      );
      return;
    }

    const resultado =
      origem === 'camara'
        ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });

    if (resultado.canceled || resultado.assets.length === 0) return;

    // Copia a foto para um sítio permanente já aqui, assim que é escolhida,
    // em vez de esperar até depois da análise (que pode demorar vários
    // segundos com as tentativas automáticas). O ficheiro temporário do
    // sistema pode desaparecer entretanto; este não.
    const uriTemporario = resultado.assets[0].uri;
    const uriPermanente = await guardarFotoPermanente(uriTemporario);

    if (uriPermanente) {
      setUriFoto(uriPermanente);
      setUriFotoPersistida(uriPermanente);
    } else {
      // Não conseguimos guardar a foto de forma permanente. Continuas a
      // conseguir analisá-la agora (usa-se o caminho temporário só para
      // isto), mas não a vamos referenciar na conta guardada, porque esse
      // caminho pode deixar de existir a qualquer momento — é preferível
      // ficares com os itens certos e sem foto, a ficares com uma foto
      // "fantasma" que desaparece mais tarde.
      setUriFoto(uriTemporario);
      setUriFotoPersistida(undefined);
      Alert.alert(
        'Não consegui guardar a foto',
        'Vou continuar a analisá-la, mas não vai ficar disponível para veres mais tarde. Os itens ficam guardados na mesma.'
      );
    }
  };

  const processarFoto = async () => {
    if (!uriFoto) return;
    setAProcessar(true);

    try {
      // Reduz o tamanho da imagem antes de enviar, para o pedido não ficar
      // demasiado grande e a análise ser mais rápida.
      const imagemComprimida = await ImageManipulator.manipulateAsync(
        uriFoto,
        [{ resize: { width: 1200 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      if (!imagemComprimida.base64) {
        throw new Error('Não foi possível preparar a imagem');
      }

      const itens = await analisarConta(imagemComprimida.base64, 'image/jpeg');
      onItensExtraidos(itens, uriFotoPersistida);
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : 'Erro desconhecido';
      Alert.alert('Não consegui ler a conta', mensagem);
    } finally {
      setAProcessar(false);
    }
  };

  return (
    <View style={styles.container}>
      <Cabecalho />
      <Pressable style={styles.botaoVoltar} onPress={onVoltar}>
        <Text style={styles.botaoVoltarTexto}>‹ Voltar</Text>
      </Pressable>
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.subtitulo}>
        Tira uma foto à conta, ou escolhe uma da galeria.
      </Text>

      {uriFoto ? (
        <Image source={{ uri: uriFoto }} style={styles.preview} resizeMode="contain" />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderTexto}>Sem foto ainda</Text>
        </View>
      )}

      {aProcessar ? (
        <View style={styles.aProcessar}>
          <ActivityIndicator size="large" color="#3D2C25" />
          <Text style={styles.aProcessarTexto}>A ler a conta...</Text>
        </View>
      ) : (
        <>
          {uriFoto ? (
            <>
              <Pressable style={styles.botaoPrincipal} onPress={processarFoto}>
                <Text style={styles.botaoPrincipalTexto}>Analisar esta foto</Text>
              </Pressable>
              <Pressable
                style={styles.botaoSecundario}
                onPress={() => {
                  apagarFotoPermanente(uriFotoPersistida);
                  setUriFoto(null);
                  setUriFotoPersistida(undefined);
                }}
              >
                <Text style={styles.botaoSecundarioTexto}>Tirar outra foto</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable style={styles.botaoPrincipal} onPress={() => escolherFoto('camara')}>
                <Text style={styles.botaoPrincipalTexto}>Tirar foto</Text>
              </Pressable>
              <Pressable style={styles.botaoSecundario} onPress={() => escolherFoto('galeria')}>
                <Text style={styles.botaoSecundarioTexto}>Escolher da galeria</Text>
              </Pressable>
            </>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: ALTURA_CABECALHO, paddingHorizontal: 20, backgroundColor: '#fff' },
  botaoVoltar: { alignSelf: 'flex-start', marginBottom: 4 },
  botaoVoltarTexto: { color: '#3D2C25', fontSize: 15, fontWeight: '600' },
  titulo: { fontSize: 24, fontWeight: '700', color: '#3D2C25' },
  subtitulo: { fontSize: 14, color: '#555', marginTop: 4, marginBottom: 20 },
  placeholder: {
    height: 300,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  placeholderTexto: { color: '#999', fontSize: 14 },
  preview: {
    height: 300,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    marginBottom: 20,
  },
  aProcessar: { alignItems: 'center', paddingVertical: 30 },
  aProcessarTexto: { marginTop: 12, color: '#555', fontSize: 14 },
  botaoPrincipal: {
    backgroundColor: '#3D2C25',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  botaoPrincipalTexto: { color: '#fff', fontSize: 15, fontWeight: '700' },
  botaoSecundario: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  botaoSecundarioTexto: { color: '#333', fontSize: 14, fontWeight: '600' },
});
