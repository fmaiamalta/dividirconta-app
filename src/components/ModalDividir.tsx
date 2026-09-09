import React, { useState, useEffect } from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { Item, Grupo, Parte } from '../types';
import { useIdioma } from '../i18n';

interface Props {
  visivel: boolean;
  item: Item | null;
  grupos: Grupo[];
  partesIniciais: Parte[];
  onConfirmar: (partes: Parte[]) => void;
  onCancelar: () => void;
}

export default function ModalDividir({
  visivel,
  item,
  grupos,
  partesIniciais,
  onConfirmar,
  onCancelar,
}: Props) {
  const { t } = useIdioma();
  const [quantidades, setQuantidades] = useState<Record<string, number>>({});

  useEffect(() => {
    const iniciais: Record<string, number> = {};
    for (const grupo of grupos) {
      iniciais[grupo.id] = partesIniciais.find((p) => p.grupoId === grupo.id)?.quantidade ?? 0;
    }
    setQuantidades(iniciais);
  }, [item, partesIniciais, grupos]);

  if (!item) return null;

  const alterar = (grupoId: string, delta: number) => {
    setQuantidades((prev) => {
      const grupo = grupos.find((g) => g.id === grupoId);
      const maxGrupo = grupo?.numPessoas ?? 99;
      const atual = prev[grupoId] ?? 0;
      let novo = Math.max(0, Math.min(maxGrupo, atual + delta));

      // Para itens com mais do que 1 unidade (ex: 3x Bijou), o total entre
      // todos os grupos não pode ultrapassar as unidades compradas — não
      // faz sentido teres mais gente a consumir do que produtos existem.
      // Isto não se aplica a itens de 1 unidade só (ex: garrafa partilhada),
      // onde o número de pessoas pode legitimamente ser maior que 1.
      if (item.quantidade > 1 && delta > 0) {
        const totalOutros = Object.entries(prev)
          .filter(([id]) => id !== grupoId)
          .reduce((s, [, q]) => s + q, 0);
        const maxPermitido = Math.max(0, item.quantidade - totalOutros);
        novo = Math.min(novo, maxPermitido);
      }

      return { ...prev, [grupoId]: novo };
    });
  };

  const podeIncrementar = (grupoId: string): boolean => {
    const grupo = grupos.find((g) => g.id === grupoId);
    const atual = quantidades[grupoId] ?? 0;
    if (grupo && atual >= grupo.numPessoas) return false;
    if (item.quantidade > 1) {
      const total = Object.values(quantidades).reduce((s, q) => s + q, 0);
      if (total >= item.quantidade) return false;
    }
    return true;
  };

  const valorTotal = item.preco * item.quantidade;
  const totalPessoas = Object.values(quantidades).reduce((s, q) => s + q, 0);
  const valorPorPessoa = totalPessoas > 0 ? valorTotal / totalPessoas : 0;

  const confirmar = () => {
    const partes: Parte[] = grupos
      .filter((g) => (quantidades[g.id] ?? 0) > 0)
      .map((g) => ({ grupoId: g.id, quantidade: quantidades[g.id] }));
    onConfirmar(partes);
  };

  // Atalho para o caso comum de "toda a gente consumiu isto" (ex: água).
  // Em itens de várias unidades, distribui uma pessoa de cada vez,
  // alternando entre grupos, até esgotar as unidades — evita que o
  // primeiro grupo fique com tudo e os outros a zero.
  const marcarTodos = () => {
    if (item.quantidade > 1) {
      const preenchido: Record<string, number> = {};
      for (const g of grupos) preenchido[g.id] = 0;

      let restante = item.quantidade;
      let avancou = true;
      while (restante > 0 && avancou) {
        avancou = false;
        for (const g of grupos) {
          if (restante <= 0) break;
          if (preenchido[g.id] < g.numPessoas) {
            preenchido[g.id]++;
            restante--;
            avancou = true;
          }
        }
      }
      setQuantidades(preenchido);
    } else {
      const cheio: Record<string, number> = {};
      for (const g of grupos) cheio[g.id] = g.numPessoas;
      setQuantidades(cheio);
    }
  };

  const limparTodos = () => {
    const vazio: Record<string, number> = {};
    for (const g of grupos) vazio[g.id] = 0;
    setQuantidades(vazio);
  };

  return (
    <Modal visible={visivel} transparent animationType="fade">
      <View style={styles.fundo}>
        <View style={styles.caixa}>
          <Text style={styles.titulo}>{item.nome}</Text>
          <Text style={styles.subtitulo}>{t.modalDividir.subtitulo(valorTotal.toFixed(2))}</Text>

          <View style={styles.atalhos}>
            <Pressable style={styles.botaoAtalho} onPress={marcarTodos}>
              <Text style={styles.botaoAtalhoTexto}>{t.modalDividir.todosConsumiram}</Text>
            </Pressable>
            <Pressable style={styles.botaoAtalho} onPress={limparTodos}>
              <Text style={styles.botaoAtalhoTexto}>{t.modalDividir.limpar}</Text>
            </Pressable>
          </View>

          {grupos.map((g) => {
            const qtd = quantidades[g.id] ?? 0;
            const incrementoBloqueado = !podeIncrementar(g.id);
            return (
              <View key={g.id} style={styles.linhaGrupo}>
                <View style={styles.grupoInfo}>
                  <View style={[styles.corBolinha, { backgroundColor: g.cor }]} />
                  <Text style={styles.grupoNome}>{g.nome} ({g.numPessoas})</Text>
                </View>
                <View style={styles.stepper}>
                  <Pressable style={styles.stepperBotao} onPress={() => alterar(g.id, -1)}>
                    <Text style={styles.stepperBotaoTexto}>−</Text>
                  </Pressable>
                  <Text style={styles.stepperValor}>{qtd}</Text>
                  <Pressable
                    style={[styles.stepperBotao, incrementoBloqueado && styles.stepperBotaoDesativado]}
                    onPress={() => alterar(g.id, 1)}
                    disabled={incrementoBloqueado}
                  >
                    <Text style={styles.stepperBotaoTexto}>+</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}

          {item.quantidade > 1 && (
            <Text style={styles.notaUnidades}>
              {t.modalDividir.unidadesAtribuidas(totalPessoas, item.quantidade)}
            </Text>
          )}

          {totalPessoas > 0 && (
            <Text style={styles.calculo}>
              {t.modalDividir.porPessoa(valorPorPessoa.toFixed(2), totalPessoas)}
            </Text>
          )}

          <View style={styles.botoes}>
            <Pressable style={styles.botaoCancelar} onPress={onCancelar}>
              <Text style={styles.botaoCancelarTexto}>{t.comum.cancelar}</Text>
            </Pressable>
            <Pressable
              style={[styles.botaoConfirmar, totalPessoas === 0 && styles.botaoDesativado]}
              disabled={totalPessoas === 0}
              onPress={confirmar}
            >
              <Text style={styles.botaoConfirmarTexto}>{t.comum.confirmar}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  caixa: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
  },
  titulo: {
    fontSize: 17,
    fontWeight: '700',
    color: '#3D2C25',
  },
  subtitulo: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
    marginBottom: 14,
  },
  atalhos: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  botaoAtalho: {
    borderWidth: 1,
    borderColor: '#3D2C25',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  botaoAtalhoTexto: {
    color: '#3D2C25',
    fontSize: 12,
    fontWeight: '600',
  },
  linhaGrupo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  grupoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  corBolinha: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  grupoNome: {
    fontSize: 14,
    color: '#222',
    fontWeight: '500',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepperBotao: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBotaoTexto: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  stepperBotaoDesativado: {
    opacity: 0.35,
  },
  notaUnidades: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  stepperValor: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3D2C25',
    minWidth: 28,
    textAlign: 'center',
  },
  calculo: {
    fontSize: 13,
    color: '#3D2C25',
    marginTop: 10,
    marginBottom: 4,
    fontWeight: '600',
  },
  botoes: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 14,
    gap: 10,
  },
  botaoCancelar: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  botaoCancelarTexto: {
    color: '#666',
    fontSize: 14,
  },
  botaoConfirmar: {
    backgroundColor: '#3D2C25',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  botaoDesativado: {
    opacity: 0.4,
  },
  botaoConfirmarTexto: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
