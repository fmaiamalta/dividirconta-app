import { Conta, TotalPorGrupo } from '../types';

export function gerarTextoResumo(conta: Conta, totais: TotalPorGrupo[]): string {
  const linhas: string[] = [];
  linhas.push(conta.nome);
  linhas.push('');

  for (const t of totais) {
    linhas.push(`${t.nome}: ${t.total.toFixed(2)} €`);
    linhas.push(`  Comida: ${t.totalComida.toFixed(2)} €`);
    linhas.push(`  Bebida: ${t.totalBebida.toFixed(2)} €`);
    if (t.totalOutro > 0) {
      linhas.push(`  Outro: ${t.totalOutro.toFixed(2)} €`);
    }
    linhas.push('');
  }

  const totalGeral = totais.reduce((s, t) => s + t.total, 0);
  linhas.push(`Total: ${totalGeral.toFixed(2)} €`);

  return linhas.join('\n');
}
