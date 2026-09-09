import { Dicionario } from './pt';

// English dictionary. Shape must mirror pt.ts exactly (enforced by the
// Dicionario type below) so a missing translation fails at compile time
// instead of silently falling back.
export const en: Dicionario = {
  comum: {
    cancelar: 'Cancel',
    guardar: 'Save',
    apagar: 'Delete',
    editar: 'Edit',
    confirmar: 'Confirm',
    voltar: '‹ Back',
  },

  cabecalho: {
    trocarIdioma: 'PT',
  },

  inicio: {
    asTuasContas: 'Your bills',
    contaConcluida: (total: string) => `Done · ${total} €`,
    contaPendente: 'Not finished',
    gruposGuardados: 'Saved groups',
    semGrupos: "You don't have any saved groups yet.",
    numGrupos: (n: number) => `${n} ${n === 1 ? 'group' : 'groups'}`,
    numItens: (n: number) => `${n} ${n === 1 ? 'item' : 'items'}`,
    novaConta: '+ New bill',
    confirmarApagarModeloTitulo: (nome: string) => `Delete "${nome}"?`,
    confirmarApagarModeloMsg: "The groups saved here will be gone. You can't undo this.",
    confirmarApagarContaTitulo: (nome: string) => `Delete "${nome}"?`,
    confirmarApagarContaMsg:
      "The photo and everything you've already assigned on this bill will be gone. You can't undo this.",
  },

  captura: {
    subtitulo: 'Take a photo of the receipt, choose one from your gallery, or import a scanned PDF.',
    semFoto: 'No photo yet',
    aLerConta: 'Reading the receipt...',
    analisarFoto: 'Analyse this photo',
    tirarOutraFoto: 'Take another photo',
    tirarFoto: 'Take photo',
    escolherGaleria: 'Choose from gallery',
    importarPdf: 'Import PDF',
    analisarPdf: 'Analyse this PDF',
    escolherOutroPdf: 'Choose another PDF',
    pdfSelecionado: (nome: string) => `PDF selected: ${nome}`,
    permissaoTitulo: 'Permission needed',
    permissaoCamara: 'You need to allow access to the camera to take a photo of the receipt.',
    permissaoGaleria: 'You need to allow access to your photos to choose the receipt image.',
    naoGuardouFotoTitulo: "Couldn't save the photo",
    naoGuardouFotoMsg:
      "I'll still analyse it, but it won't be available to look at later. The items will be saved either way.",
    naoConseguiuLerTitulo: "Couldn't read the receipt",
    naoConseguiuAbrirPdfTitulo: "Couldn't open the PDF",
    pdfGrandeTitulo: 'This PDF is large',
    pdfGrandeMsg: 'It may take longer to analyse, or fail if it’s too large. If it fails, try scanning at a lower quality or using a photo instead of the PDF.',
  },

  itens: {
    recomecar: 'Start over',
    grupos: 'Groups',
    comida: 'Food',
    bebida: 'Drinks',
    outro: 'Other',
    porAtribuir: (n: number) => `${n} unassigned`,
    porResolver: (n: number) => `${n} unresolved`,
    itensSelecionados: (n: number) => `${n} ${n === 1 ? 'item' : 'items'} selected`,
    verResumo: 'View summary and totals',
    faltaAtribuir: (n: number) => `${n} ${n === 1 ? 'item' : 'items'} left to assign`,
    aindaFaltaAtribuirTitulo: 'Some items still need assigning',
    semAtribuicao: (nome: string) => `"${nome}" hasn't been assigned to any group yet`,
    faltamPessoas: (nome: string, faltam: number, qtd: number) =>
      `"${nome}" has ${faltam} ${faltam === 1 ? 'person' : 'people'} left to identify (bought ${qtd})`,
    recomecarTitulo: 'Start over from scratch?',
    recomecarMsg:
      "You'll lose the current photo and everything you've assigned. It won't affect the groups you've already set up.",
  },

  resumo: {
    totalConta: (v: string) => `Bill total: ${v} €`,
    totalAPagar: 'Total to pay',
    avisoNaoAtribuido: (v: string) => `Heads up: ${v} € of the bill still isn't assigned to anyone.`,
    partilharResumo: 'Share summary',
    voltarAosItens: 'Back to items',
    inicio: 'Home',
  },

  gruposEcra: {
    tituloGrupos: 'Groups',
    tituloEditar: 'Edit groups',
    subtitulo: 'Set the name, colour and how many people are in each group.',
    nomeDestaConta: 'Name for this bill',
    placeholderNomeConta: 'e.g. Saturday dinner',
    placeholderNomeGrupo: 'Group name',
    numPessoas: 'Number of people',
    adicionarGrupo: '+ Add group',
    apagarContaBotao: 'Delete this bill',
    apagarContaTitulo: 'Delete this bill?',
    apagarContaMsg: "The groups saved here will be gone. This won't affect bills already in progress.",
    grupoDefaultNome: (letra: string) => `Group ${letra}`,
  },

  itemRow: {
    porAtribuir: 'Unassigned',
    faltamDe: (falta: number, total: number) =>
      `${falta} ${falta === 1 ? 'person' : 'people'} left of ${total}`,
    dividir: 'Split',
  },

  modalDividir: {
    subtitulo: (v: string) => `${v} € total — how many people from each group had this?`,
    todosConsumiram: 'Everyone had it',
    limpar: 'Clear',
    unidadesAtribuidas: (a: number, total: number) => `${a} of ${total} units assigned`,
    porPessoa: (v: string, n: number) => `${v} € per person (÷ ${n})`,
  },

  analiseFoto: {
    erroServidorStatus: (status: number) => `The server responded with an error (${status})`,
    erroRespostaVazia: 'The server returned an empty response',
    erroSemItens: "Couldn't identify any items in this photo",
    erroFalhaDesconhecida: 'Unknown failure while reading the receipt',
    erroPrepararImagem: "Couldn't prepare the image",
    erroDesconhecido: 'Unknown error',
  },

  partilha: {
    total: 'Total',
  },

  app: {
    novaContaDeModelo: (nomeModelo: string) => `New bill from "${nomeModelo}"`,
    novaConta: 'New bill',
    semNome: 'Untitled',
  },
};
