// Dicionário de português (idioma por omissão).
export const pt = {
  comum: {
    cancelar: 'Cancelar',
    guardar: 'Guardar',
    apagar: 'Apagar',
    editar: 'Editar',
    confirmar: 'Confirmar',
    voltar: '‹ Voltar',
  },

  cabecalho: {
    trocarIdioma: 'EN',
  },

  inicio: {
    asTuasContas: 'As tuas contas',
    contaConcluida: (total: string) => `Concluída · ${total} €`,
    contaPendente: 'Por terminar',
    gruposGuardados: 'Grupos guardados',
    semGrupos: 'Ainda não tens nenhum grupo guardado.',
    numGrupos: (n: number) => `${n} ${n === 1 ? 'grupo' : 'grupos'}`,
    numItens: (n: number) => `${n} ${n === 1 ? 'item' : 'itens'}`,
    novaConta: '+ Nova conta',
    confirmarApagarModeloTitulo: (nome: string) => `Apagar "${nome}"?`,
    confirmarApagarModeloMsg: 'Os grupos guardados aqui desaparecem. Não podes desfazer isto.',
    confirmarApagarContaTitulo: (nome: string) => `Apagar "${nome}"?`,
    confirmarApagarContaMsg:
      'A foto e tudo o que já atribuíste nesta conta desaparecem. Não podes desfazer isto.',
  },

  captura: {
    subtitulo: 'Tira uma foto à conta, escolhe uma da galeria, ou importa um PDF digitalizado.',
    semFoto: 'Sem foto ainda',
    aLerConta: 'A ler a conta...',
    analisarFoto: 'Analisar esta foto',
    tirarOutraFoto: 'Tirar outra foto',
    tirarFoto: 'Tirar foto',
    escolherGaleria: 'Escolher da galeria',
    importarPdf: 'Importar PDF',
    analisarPdf: 'Analisar este PDF',
    escolherOutroPdf: 'Escolher outro PDF',
    pdfSelecionado: (nome: string) => `PDF selecionado: ${nome}`,
    permissaoTitulo: 'Permissão necessária',
    permissaoCamara: 'Precisas de dar acesso à câmara para tirar a foto da conta.',
    permissaoGaleria: 'Precisas de dar acesso às fotos para escolher a imagem da conta.',
    naoGuardouFotoTitulo: 'Não consegui guardar a foto',
    naoGuardouFotoMsg:
      'Vou continuar a analisá-la, mas não vai ficar disponível para veres mais tarde. Os itens ficam guardados na mesma.',
    naoConseguiuLerTitulo: 'Não consegui ler a conta',
    naoConseguiuAbrirPdfTitulo: 'Não consegui abrir o PDF',
    pdfGrandeTitulo: 'Este PDF é grande',
    pdfGrandeMsg: 'Pode demorar mais tempo a analisar, ou falhar se for demasiado grande. Se falhar, tenta digitalizar em menor qualidade ou usar uma foto em vez do PDF.',
  },

  itens: {
    recomecar: 'Recomeçar',
    grupos: 'Grupos',
    comida: 'Comida',
    bebida: 'Bebida',
    outro: 'Outro',
    porAtribuir: (n: number) => `${n} por atribuir`,
    porResolver: (n: number) => `${n} por resolver`,
    itensSelecionados: (n: number) => `${n} ${n === 1 ? 'item selecionado' : 'itens selecionados'}`,
    verResumo: 'Ver resumo e totais',
    faltaAtribuir: (n: number) => `Falta atribuir ${n} ${n === 1 ? 'item' : 'itens'}`,
    aindaFaltaAtribuirTitulo: 'Ainda falta atribuir itens',
    semAtribuicao: (nome: string) => `"${nome}" ainda não foi atribuído a nenhum grupo`,
    faltamPessoas: (nome: string, faltam: number, qtd: number) =>
      `"${nome}" tem ${faltam} ${faltam === 1 ? 'pessoa' : 'pessoas'} por identificar (comprou-se ${qtd})`,
    recomecarTitulo: 'Recomeçar do zero?',
    recomecarMsg:
      'Perdes a foto atual e tudo o que já atribuíste. Não afeta os grupos que já configuraste.',
  },

  resumo: {
    totalConta: (v: string) => `Total da conta: ${v} €`,
    totalAPagar: 'Total a pagar',
    avisoNaoAtribuido: (v: string) => `Atenção: ${v} € da conta ainda não está atribuído a ninguém.`,
    partilharResumo: 'Partilhar resumo',
    voltarAosItens: 'Voltar aos itens',
    inicio: 'Início',
  },

  gruposEcra: {
    tituloGrupos: 'Grupos',
    tituloEditar: 'Editar grupos',
    subtitulo: 'Define o nome, a cor e quantas pessoas tem cada grupo.',
    nomeDestaConta: 'Nome desta conta',
    placeholderNomeConta: 'ex: Jantar de sábado',
    placeholderNomeGrupo: 'Nome do grupo',
    numPessoas: 'Nº de pessoas',
    adicionarGrupo: '+ Adicionar grupo',
    apagarContaBotao: 'Apagar esta conta',
    apagarContaTitulo: 'Apagar esta conta?',
    apagarContaMsg:
      'Os grupos guardados aqui desaparecem. Isto não afeta contas que já estejam em curso.',
    grupoDefaultNome: (letra: string) => `Grupo ${letra}`,
  },

  itemRow: {
    porAtribuir: 'Por atribuir',
    faltamDe: (falta: number, total: number) =>
      `Faltam ${falta} ${falta === 1 ? 'pessoa' : 'pessoas'} de ${total}`,
    dividir: 'Dividir',
  },

  modalDividir: {
    subtitulo: (v: string) => `${v} € no total — quantas pessoas de cada grupo consumiram isto?`,
    todosConsumiram: 'Todos consumiram',
    limpar: 'Limpar',
    unidadesAtribuidas: (a: number, total: number) => `${a} de ${total} unidades atribuídas`,
    porPessoa: (v: string, n: number) => `${v} € por pessoa (÷ ${n})`,
  },

  analiseFoto: {
    erroServidorStatus: (status: number) => `O servidor respondeu com erro (${status})`,
    erroRespostaVazia: 'O servidor devolveu uma resposta vazia',
    erroSemItens: 'Não foi possível identificar itens nesta foto',
    erroFalhaDesconhecida: 'Falha desconhecida ao analisar a conta',
    erroPrepararImagem: 'Não foi possível preparar a imagem',
    erroDesconhecido: 'Erro desconhecido',
  },

  partilha: {
    total: 'Total',
  },

  app: {
    novaContaDeModelo: (nomeModelo: string) => `Nova conta de "${nomeModelo}"`,
    novaConta: 'Nova conta',
    semNome: 'Sem nome',
  },
};

export type Dicionario = typeof pt;
