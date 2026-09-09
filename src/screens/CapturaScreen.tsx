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
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Item } from '../types';
import { analisarConta } from '../utils/analiseFoto';
import { guardarFotoPermanente, apagarFotoPermanente } from '../utils/armazenamento';
import Cabecalho, { ALTURA_CABECALHO } from '../components/Cabecalho';
import { useIdioma } from '../i18n';

interface Props {
  titulo: string;
  onItensExtraidos: (itens: Item[], fotoUri?: string) => void;
  onVoltar: () => void;
}

interface PdfEscolhido {
  uri: string;
  nome: string;
}

export default function CapturaScreen({ titulo, onItensExtraidos, onVoltar }: Props) {
  const { t, idioma } = useIdioma();
  const [uriFoto, setUriFoto] = useState<string | null>(null);
  const [uriFotoPersistida, setUriFotoPersistida] = useState<string | undefined>(undefined);
  const [pdfEscolhido, setPdfEscolhido] = useState<PdfEscolhido | null>(null);
  const [aProcessar, setAProcessar] = useState(false);

  const escolherFoto = async (origem: 'camara' | 'galeria') => {
    const permissao =
      origem === 'camara'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissao.granted) {
      Alert.alert(
        t.captura.permissaoTitulo,
        origem === 'camara' ? t.captura.permissaoCamara : t.captura.permissaoGaleria
      );
      return;
    }

    const resultado =
      origem === 'camara'
        ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });

    if (resultado.canceled || resultado.assets.length === 0) return;

    setPdfEscolhido(null);

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
      Alert.alert(t.captura.naoGuardouFotoTitulo, t.captura.naoGuardouFotoMsg);
    }
  };

  const escolherPdf = async () => {
    try {
      const resultado = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
      if (resultado.canceled || resultado.assets.length === 0) return;

      const ficheiro = resultado.assets[0];

      // Ao contrário das fotos (sempre comprimidas antes de enviar), o PDF
      // vai tal e qual, em base64 (~33% maior). Um ficheiro grande pode
      // ultrapassar o limite de tamanho do pedido no backend — melhor
      // avisar já do que deixar a pessoa à espera de 3 tentativas a falhar.
      const LIMITE_AVISO_BYTES = 3.5 * 1024 * 1024;
      if (ficheiro.size !== undefined && ficheiro.size > LIMITE_AVISO_BYTES) {
        Alert.alert(t.captura.pdfGrandeTitulo, t.captura.pdfGrandeMsg);
      }

      setUriFoto(null);
      setUriFotoPersistida(undefined);
      setPdfEscolhido({ uri: ficheiro.uri, nome: ficheiro.name });
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : t.analiseFoto.erroDesconhecido;
      Alert.alert(t.captura.naoConseguiuAbrirPdfTitulo, mensagem);
    }
  };

  const processarFoto = async () => {
    if (!uriFoto && !pdfEscolhido) return;
    setAProcessar(true);

    try {
      let itens: Item[];

      if (pdfEscolhido) {
        // PDFs não passam pelo expo-image-manipulator (é só para imagens)
        // — vão tal e qual, em base64, para o backend.
        const base64Pdf = await FileSystem.readAsStringAsync(pdfEscolhido.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        itens = await analisarConta(base64Pdf, 'application/pdf', idioma, t);
        // Sem fotoUri para PDFs — não há como mostrar uma miniatura de
        // um PDF no ecrã Início, por isso a conta fica sem foto associada,
        // tal como já acontece quando a cópia da foto falha.
        onItensExtraidos(itens, undefined);
      } else if (uriFoto) {
        // Reduz o tamanho da imagem antes de enviar, para o pedido não ficar
        // demasiado grande e a análise ser mais rápida.
        const imagemComprimida = await ImageManipulator.manipulateAsync(
          uriFoto,
          [{ resize: { width: 1200 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
        );

        if (!imagemComprimida.base64) {
          throw new Error(t.analiseFoto.erroPrepararImagem);
        }

        itens = await analisarConta(imagemComprimida.base64, 'image/jpeg', idioma, t);
        onItensExtraidos(itens, uriFotoPersistida);
      }
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : t.analiseFoto.erroDesconhecido;
      Alert.alert(t.captura.naoConseguiuLerTitulo, mensagem);
    } finally {
      setAProcessar(false);
    }
  };

  return (
    <View style={styles.container}>
      <Cabecalho />
      <Pressable style={styles.botaoVoltar} onPress={onVoltar}>
        <Text style={styles.botaoVoltarTexto}>{t.comum.voltar}</Text>
      </Pressable>
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.subtitulo}>{t.captura.subtitulo}</Text>

      {uriFoto ? (
        <Image source={{ uri: uriFoto }} style={styles.preview} resizeMode="contain" />
      ) : pdfEscolhido ? (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderIconePdf}>📄</Text>
          <Text style={styles.placeholderTexto}>{t.captura.pdfSelecionado(pdfEscolhido.nome)}</Text>
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderTexto}>{t.captura.semFoto}</Text>
        </View>
      )}

      {aProcessar ? (
        <View style={styles.aProcessar}>
          <ActivityIndicator size="large" color="#3D2C25" />
          <Text style={styles.aProcessarTexto}>{t.captura.aLerConta}</Text>
        </View>
      ) : (
        <>
          {uriFoto ? (
            <>
              <Pressable style={styles.botaoPrincipal} onPress={processarFoto}>
                <Text style={styles.botaoPrincipalTexto}>{t.captura.analisarFoto}</Text>
              </Pressable>
              <Pressable
                style={styles.botaoSecundario}
                onPress={() => {
                  apagarFotoPermanente(uriFotoPersistida);
                  setUriFoto(null);
                  setUriFotoPersistida(undefined);
                }}
              >
                <Text style={styles.botaoSecundarioTexto}>{t.captura.tirarOutraFoto}</Text>
              </Pressable>
            </>
          ) : pdfEscolhido ? (
            <>
              <Pressable style={styles.botaoPrincipal} onPress={processarFoto}>
                <Text style={styles.botaoPrincipalTexto}>{t.captura.analisarPdf}</Text>
              </Pressable>
              <Pressable style={styles.botaoSecundario} onPress={() => setPdfEscolhido(null)}>
                <Text style={styles.botaoSecundarioTexto}>{t.captura.escolherOutroPdf}</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable style={styles.botaoPrincipal} onPress={() => escolherFoto('camara')}>
                <Text style={styles.botaoPrincipalTexto}>{t.captura.tirarFoto}</Text>
              </Pressable>
              <Pressable style={styles.botaoSecundario} onPress={() => escolherFoto('galeria')}>
                <Text style={styles.botaoSecundarioTexto}>{t.captura.escolherGaleria}</Text>
              </Pressable>
              <Pressable style={styles.botaoSecundario} onPress={escolherPdf}>
                <Text style={styles.botaoSecundarioTexto}>{t.captura.importarPdf}</Text>
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
    paddingHorizontal: 24,
  },
  placeholderTexto: { color: '#999', fontSize: 14, textAlign: 'center' },
  placeholderIconePdf: { fontSize: 40, marginBottom: 10 },
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
