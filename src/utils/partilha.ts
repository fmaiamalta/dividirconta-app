import { Conta, TotalPorGrupo } from '../types';
import { Dicionario } from '../i18n/pt';
import { nomeExibicaoConta } from '../i18n';

export function gerarTextoResumo(conta: Conta, totais: TotalPorGrupo[], t: Dicionario): string {
  const linhas: string[] = [];
  linhas.push(nomeExibicaoConta(conta, t));
  linhas.push('');

  for (const grupo of totais) {
    linhas.push(`${grupo.nome}: ${grupo.total.toFixed(2)} €`);
    linhas.push(`  ${t.itens.comida}: ${grupo.totalComida.toFixed(2)} €`);
    linhas.push(`  ${t.itens.bebida}: ${grupo.totalBebida.toFixed(2)} €`);
    if (grupo.totalOutro > 0) {
      linhas.push(`  ${t.itens.outro}: ${grupo.totalOutro.toFixed(2)} €`);
    }
    linhas.push('');
  }

  const totalGeral = totais.reduce((s, grupo) => s + grupo.total, 0);
  linhas.push(`${t.partilha.total}: ${totalGeral.toFixed(2)} €`);

  return linhas.join('\n');
}
