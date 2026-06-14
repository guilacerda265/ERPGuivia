import { z } from 'zod';

/**
 * Fonte única de tipos/validações compartilhada entre a API (NestJS) e o front (React).
 * Espelha os enums do domínio (ver arquitetura-de-dominio.md) e valida as fronteiras.
 * Dinheiro SEMPRE em centavos (inteiro) — nunca float.
 */

// ----------------------- enums de domínio -----------------------
export const PAPEIS = ['DONO', 'VENDEDOR'] as const;
export type Papel = (typeof PAPEIS)[number];

export const TIPOS_MODA = ['CALCADO', 'ROUPA', 'ACESSORIO'] as const;
export type TipoModa = (typeof TIPOS_MODA)[number];

export const TIPOS_MOVIMENTO = [
  'ENTRADA',
  'SAIDA',
  'VENDA',
  'ESTORNO_VENDA',
  'ACERTO_INVENTARIO',
  'AJUSTE',
] as const;
export type TipoMovimento = (typeof TIPOS_MOVIMENTO)[number];

export const FORMAS_PAGAMENTO = [
  'DINHEIRO',
  'PIX',
  'DEBITO',
  'CREDITO',
  'CREDIARIO',
  'VALE_TROCA',
  'OUTRO',
] as const;
export type FormaPagamentoTipo = (typeof FORMAS_PAGAMENTO)[number];

export const STATUS_VENDA = ['CONCLUIDA', 'CANCELADA'] as const;
export type StatusVenda = (typeof STATUS_VENDA)[number];

// ----------------------- helpers -----------------------
/** Valor monetário em centavos (inteiro, não-negativo). */
export const centavos = z.number().int().nonnegative();

// ----------------------- onboarding / identidade -----------------------
export const criarContaSchema = z.object({
  nomeNegocio: z.string().min(1, 'Informe o nome da loja'),
  nomeUsuario: z.string().min(1, 'Informe seu nome'),
  telefone: z.string().optional(),
  email: z.string().email().optional(),
  senha: z.string().min(6, 'A senha precisa de ao menos 6 caracteres'),
});
export type CriarConta = z.infer<typeof criarContaSchema>;

export const loginSchema = z.object({
  identificador: z.string().min(1), // email ou telefone
  senha: z.string().min(1),
});
export type Login = z.infer<typeof loginSchema>;

// ----------------------- categoria / marca / coleção -----------------------
export const criarCategoriaSchema = z.object({
  nome: z.string().min(1, 'Informe o nome da categoria'),
  tipoModa: z.enum(TIPOS_MODA).optional(),
  parentId: z.string().uuid().optional(),
});
export type CriarCategoria = z.infer<typeof criarCategoriaSchema>;

export const criarMarcaSchema = z.object({ nome: z.string().min(1, 'Informe a marca') });
export type CriarMarca = z.infer<typeof criarMarcaSchema>;

export const criarColecaoSchema = z.object({
  nome: z.string().min(1, 'Informe a coleção'),
  ano: z.number().int().optional(),
  estacao: z.string().optional(),
});
export type CriarColecao = z.infer<typeof criarColecaoSchema>;

// ----------------------- produto / grade -----------------------
export const criarProdutoSchema = z.object({
  nome: z.string().min(1, 'Informe o nome do produto'),
  categoriaId: z.string().uuid().optional(),
  marcaId: z.string().uuid().optional(),
  colecaoId: z.string().uuid().optional(),
  custoCompraCentavos: centavos.default(0),
  markupPercentual: z.number().int().min(0).default(0), // ex.: 150 = 150%
  precoBaseCentavos: centavos,
  cores: z.array(z.string().min(1)).min(1, 'Escolha ao menos uma cor'),
  tamanhos: z.array(z.string().min(1)).min(1, 'Escolha ao menos um tamanho'),
});
export type CriarProduto = z.infer<typeof criarProdutoSchema>;

/** Preço sugerido a partir do custo e do markup (em %). */
export function precoSugeridoCentavos(custoCentavos: number, markupPercentual: number): number {
  return Math.round(custoCentavos * (1 + markupPercentual / 100));
}

// ----------------------- venda (transação atômica) -----------------------
export const itemVendaSchema = z.object({
  variacaoId: z.string().uuid(),
  quantidade: z.number().int().positive(),
  descontoCentavos: centavos.default(0),
});

export const pagamentoSchema = z.object({
  formaPagamentoId: z.string().uuid(),
  valorCentavos: centavos,
});

export const criarVendaSchema = z.object({
  lojaId: z.string().uuid().optional(), // o servidor usa a loja do token
  clienteId: z.string().uuid().optional(),
  vendedorId: z.string().uuid().optional(),
  itens: z.array(itemVendaSchema).min(1, 'Adicione ao menos um item'),
  descontoCentavos: centavos.default(0),
  pagamentos: z.array(pagamentoSchema).min(1, 'Informe o pagamento'),
  permitirSemEstoque: z.boolean().default(false),
});
export type CriarVenda = z.infer<typeof criarVendaSchema>;

// ----------------------- fornecedor / entrada de estoque -----------------------
export const criarFornecedorSchema = z.object({
  nome: z.string().min(1, 'Informe o fornecedor'),
  documento: z.string().optional(),
  contato: z.string().optional(),
});
export type CriarFornecedor = z.infer<typeof criarFornecedorSchema>;

export const itemEntradaSchema = z.object({
  variacaoId: z.string().uuid(),
  quantidade: z.number().int().positive(),
  custoUnitarioCentavos: centavos.default(0),
});

export const criarEntradaSchema = z.object({
  fornecedorId: z.string().uuid().optional(),
  numeroNota: z.string().optional(),
  observacao: z.string().optional(),
  itens: z.array(itemEntradaSchema).min(1, 'Informe ao menos um item'),
});
export type CriarEntrada = z.infer<typeof criarEntradaSchema>;

// ----------------------- caixa -----------------------
export const abrirCaixaSchema = z.object({ valorAberturaCentavos: centavos.default(0) });
export type AbrirCaixa = z.infer<typeof abrirCaixaSchema>;

export const fecharCaixaSchema = z.object({ valorFechamentoInformadoCentavos: centavos });
export type FecharCaixa = z.infer<typeof fecharCaixaSchema>;

export const lancamentoCaixaSchema = z.object({
  tipo: z.enum(['ENTRADA', 'SAIDA']),
  categoria: z.enum(['SANGRIA', 'SUPRIMENTO', 'DESPESA', 'OUTRO']),
  valorCentavos: z.number().int().positive(),
  descricao: z.string().optional(),
});
export type LancamentoCaixaInput = z.infer<typeof lancamentoCaixaSchema>;
