import { Conta } from '../types';

// Cenário: jantar de 3 grupos (5 + 5 + 3 pessoas).
// Cada grupo escolhe os seus pratos; as bebidas partilhadas
// são divididas pelo número de pessoas de cada grupo que as consumiu.
export const contaExemplo: Conta = {
  id: 'conta-1',
  nome: 'Jantar de sábado',
  taxaServicoPercent: 0,
  grupos: [
    { id: 'grupo-a', nome: 'Grupo A', cor: '#E8B08C', numPessoas: 5 },
    { id: 'grupo-b', nome: 'Grupo B', cor: '#9FD8BE', numPessoas: 5 },
    { id: 'grupo-c', nome: 'Grupo C', cor: '#C3B2E0', numPessoas: 3 },
  ],
  itens: [
    // Comida — normalmente exclusiva de um grupo
    { id: 'i1', nome: 'Bacalhau à Brás', preco: 14.5, quantidade: 1, categoria: 'comida' },
    { id: 'i2', nome: 'Francesinha', preco: 12.0, quantidade: 1, categoria: 'comida' },
    { id: 'i3', nome: 'Arroz de Marisco', preco: 28.0, quantidade: 1, categoria: 'comida' },
    { id: 'i4', nome: 'Bife à Café', preco: 13.5, quantidade: 1, categoria: 'comida' },
    { id: 'i5', nome: 'Polvo à Lagareiro', preco: 16.0, quantidade: 1, categoria: 'comida' },
    { id: 'i6', nome: 'Salada Mista', preco: 6.5, quantidade: 1, categoria: 'comida' },
    { id: 'i7', nome: 'Costeleta de Vitela', preco: 15.0, quantidade: 1, categoria: 'comida' },
    { id: 'i8', nome: 'Massa à Bulhão Pato', preco: 11.0, quantidade: 1, categoria: 'comida' },
    // Bebidas — algumas partilhadas entre pessoas de grupos diferentes
    { id: 'i9', nome: 'Garrafa Vinho Tinto', preco: 18.0, quantidade: 1, categoria: 'bebida' },
    { id: 'i10', nome: 'Imperial', preco: 2.5, quantidade: 4, categoria: 'bebida' },
    { id: 'i11', nome: 'Água 1L', preco: 2.0, quantidade: 2, categoria: 'bebida' },
    { id: 'i12', nome: 'Refrigerante', preco: 3.0, quantidade: 3, categoria: 'bebida' },
  ],
  atribuicoes: [],
};
