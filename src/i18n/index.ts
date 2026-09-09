import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pt, Dicionario } from './pt';
import { en } from './en';
import { Conta } from '../types';

export type Idioma = 'pt' | 'en';

const CHAVE_IDIOMA = '@divisao-contas/idioma';

const dicionarios = { pt, en };

function idiomaDoDispositivo(): Idioma {
  const codigo = Localization.getLocales()[0]?.languageCode ?? 'pt';
  return codigo === 'pt' ? 'pt' : 'en';
}

interface IdiomaContextValor {
  idioma: Idioma;
  trocarIdioma: () => void;
  t: typeof pt;
  localeData: string;
}

const IdiomaContext = createContext<IdiomaContextValor | null>(null);

export function IdiomaProvider({ children }: { children: ReactNode }) {
  const [idioma, setIdioma] = useState<Idioma>(idiomaDoDispositivo);
  // Se o utilizador tocar no botão de trocar idioma antes da leitura do
  // AsyncStorage (abaixo) terminar, essa leitura não pode "ganhar" e
  // reverter a escolha que acabou de ser feita.
  const jaTrocado = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(CHAVE_IDIOMA)
      .then((guardado) => {
        if (!jaTrocado.current && (guardado === 'pt' || guardado === 'en')) {
          setIdioma(guardado);
        }
      })
      .catch(() => {
        // Sem problema, fica-se pelo idioma detetado do dispositivo
      });
  }, []);

  const trocarIdioma = () => {
    jaTrocado.current = true;
    setIdioma((atual) => {
      const novo: Idioma = atual === 'pt' ? 'en' : 'pt';
      AsyncStorage.setItem(CHAVE_IDIOMA, novo);
      return novo;
    });
  };

  const valor: IdiomaContextValor = {
    idioma,
    trocarIdioma,
    t: dicionarios[idioma],
    localeData: idioma === 'pt' ? 'pt-PT' : 'en-GB',
  };

  return React.createElement(IdiomaContext.Provider, { value: valor }, children);
}

export function useIdioma(): IdiomaContextValor {
  const contexto = useContext(IdiomaContext);
  if (!contexto) throw new Error('useIdioma tem de ser usado dentro de um IdiomaProvider');
  return contexto;
}

// O "Nova conta de X" é gerado a partir do nome do modelo (texto do
// utilizador, fixo) + uma frase da interface (deve seguir o idioma atual,
// não o que estava ativo quando a conta foi criada). Contas antigas sem
// nomeModeloOrigem guardado caem no nome fixo de sempre.
export function nomeExibicaoConta(conta: Conta, t: Dicionario): string {
  return conta.nomeModeloOrigem ? t.app.novaContaDeModelo(conta.nomeModeloOrigem) : conta.nome;
}
