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

export const criarDepartamentoSchema = z.object({
  nome: z.string().min(1, 'Informe o departamento'),
});
export type CriarDepartamento = z.infer<typeof criarDepartamentoSchema>;

export const criarCorSchema = z.object({
  nome: z.string().min(1, 'Informe a cor'),
  hex: z.string().optional(),
});
export type CriarCor = z.infer<typeof criarCorSchema>;

export const criarGradeSchema = z.object({
  nome: z.string().min(1, 'Informe o nome da grade'),
  tamanhos: z.array(z.string().min(1)).min(1, 'Adicione ao menos um tamanho'),
});
export type CriarGrade = z.infer<typeof criarGradeSchema>;

// ----------------------- produto / grade -----------------------
/** Uma variação da grade. Código de barras em branco => gerado automaticamente. */
export const variacaoInputSchema = z.object({
  cor: z.string().min(1),
  tamanho: z.string().min(1),
  codigoBarras: z.string().optional(),
});
export type VariacaoInput = z.infer<typeof variacaoInputSchema>;

export const criarProdutoSchema = z.object({
  nome: z.string().min(1, 'Informe o nome do produto'),
  categoriaId: z.string().uuid('Escolha a categoria'), // obrigatório
  marcaId: z.string().uuid('Escolha a marca'), // obrigatório
  colecaoId: z.string().uuid().optional(),
  departamentoId: z.string().uuid().optional(),
  custoCompraCentavos: centavos.default(0),
  markupPercentual: z.number().int().min(0).default(0), // ex.: 150 = 150%
  precoBaseCentavos: centavos, // preço de venda (editável — pode sobrepor o sugerido)
  variacoes: z.array(variacaoInputSchema).min(1, 'Monte a grade (cor e tamanho)'),
});
export type CriarProduto = z.infer<typeof criarProdutoSchema>;

/** Variação na edição: com id = existente (atualiza); sem id = nova. */
export const variacaoUpdateSchema = z.object({
  id: z.string().uuid().optional(),
  cor: z.string().min(1),
  tamanho: z.string().min(1),
  codigoBarras: z.string().optional(),
  ativo: z.boolean().default(true),
});

export const atualizarProdutoSchema = z.object({
  nome: z.string().min(1, 'Informe o nome do produto'),
  categoriaId: z.string().uuid('Escolha a categoria'),
  marcaId: z.string().uuid('Escolha a marca'),
  colecaoId: z.string().uuid().optional(),
  departamentoId: z.string().uuid().optional(),
  custoCompraCentavos: centavos.default(0),
  markupPercentual: z.number().int().min(0).default(0),
  precoBaseCentavos: centavos,
  variacoes: z.array(variacaoUpdateSchema).min(1, 'O produto precisa de ao menos uma variação'),
});
export type AtualizarProduto = z.infer<typeof atualizarProdutoSchema>;

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
  crediario: z
    .object({
      parcelas: z.number().int().positive().default(1),
      primeiroVencimento: z.string(), // YYYY-MM-DD
      intervaloDias: z.number().int().positive().default(30),
    })
    .optional(),
});
export type CriarVenda = z.infer<typeof criarVendaSchema>;

export const receberParcelaSchema = z.object({ formaPagamentoId: z.string().uuid().optional() });
export type ReceberParcela = z.infer<typeof receberParcelaSchema>;

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

// ----------------------- cliente / crediário -----------------------
export const criarClienteSchema = z.object({
  nome: z.string().min(1, 'Informe o nome do cliente'),
  telefone: z.string().optional(),
  email: z.string().optional(),
  documento: z.string().optional(), // CPF/CNPJ
  dataNascimento: z.string().optional(),
  cep: z.string().optional(),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.string().optional(),
  limiteCreditoCentavos: centavos.optional(),
  observacao: z.string().optional(),
});
export type CriarCliente = z.infer<typeof criarClienteSchema>;

/** Quais campos do cliente são obrigatórios para vender no crediário. */
export const configCrediarioSchema = z.object({
  exigeCpf: z.boolean(),
  exigeTelefone: z.boolean(),
  exigeEndereco: z.boolean(),
  exigeNascimento: z.boolean(),
});
export type ConfigCrediarioInput = z.infer<typeof configCrediarioSchema>;
