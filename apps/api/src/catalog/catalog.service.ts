import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  CriarCategoria,
  CriarColecao,
  CriarDepartamento,
  CriarMarca,
  CriarProduto,
} from '@erp/shared';
import { PrismaService } from '../prisma/prisma.service';

/** Dígito verificador EAN-13 sobre 12 dígitos. */
function ean13(base12: string): string {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const d = base12.charCodeAt(i) - 48;
    sum += i % 2 === 0 ? d : d * 3;
  }
  const check = (10 - (sum % 10)) % 10;
  return base12 + String(check);
}

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  // ---- categorias ----
  listarCategorias(tenantId: string) {
    return this.prisma.categoria.findMany({ where: { tenantId }, orderBy: { nome: 'asc' } });
  }
  criarCategoria(tenantId: string, dto: CriarCategoria) {
    return this.prisma.categoria.create({
      data: { tenantId, nome: dto.nome, tipoModa: dto.tipoModa, parentId: dto.parentId },
    });
  }

  // ---- marcas ----
  listarMarcas(tenantId: string) {
    return this.prisma.marca.findMany({ where: { tenantId }, orderBy: { nome: 'asc' } });
  }
  criarMarca(tenantId: string, dto: CriarMarca) {
    return this.prisma.marca.create({ data: { tenantId, nome: dto.nome } });
  }

  // ---- coleções ----
  listarColecoes(tenantId: string) {
    return this.prisma.colecao.findMany({ where: { tenantId }, orderBy: { nome: 'asc' } });
  }
  criarColecao(tenantId: string, dto: CriarColecao) {
    return this.prisma.colecao.create({
      data: { tenantId, nome: dto.nome, ano: dto.ano, estacao: dto.estacao },
    });
  }

  // ---- departamentos ----
  listarDepartamentos(tenantId: string) {
    return this.prisma.departamento.findMany({ where: { tenantId }, orderBy: { nome: 'asc' } });
  }
  criarDepartamento(tenantId: string, dto: CriarDepartamento) {
    return this.prisma.departamento.create({ data: { tenantId, nome: dto.nome } });
  }

  // ---- produtos ----
  listarProdutos(tenantId: string) {
    return this.prisma.produto.findMany({
      where: { tenantId, status: 'ativo' },
      include: {
        categoria: true,
        marca: true,
        colecao: true,
        departamento: true,
        variacoes: { where: { ativo: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async obterProduto(tenantId: string, id: string) {
    const produto = await this.prisma.produto.findFirst({
      where: { id, tenantId },
      include: {
        categoria: true,
        marca: true,
        colecao: true,
        departamento: true,
        variacoes: { orderBy: [{ cor: 'asc' }, { tamanho: 'asc' }] },
      },
    });
    if (!produto) throw new NotFoundException('Produto não encontrado.');
    return produto;
  }

  /**
   * Cria o produto + a grade (variações).
   * Gera o código do produto (P00001), o código da grade (P00001-01) e o código de
   * barras (EAN-13 automático quando o usuário não digita — ex.: usar o do fornecedor).
   */
  async criarProduto(tenantId: string, dto: CriarProduto) {
    return this.prisma.comTenant(tenantId, async (tx) => {
      const seq = (await tx.produto.count({ where: { tenantId } })) + 1;
      const codigo = 'P' + String(seq).padStart(5, '0');

      const produto = await tx.produto.create({
        data: {
          tenantId,
          nome: dto.nome,
          codigo,
          categoriaId: dto.categoriaId,
          marcaId: dto.marcaId,
          colecaoId: dto.colecaoId,
          departamentoId: dto.departamentoId,
          custoCompraCentavos: dto.custoCompraCentavos,
          markupPercentual: dto.markupPercentual,
          precoBaseCentavos: dto.precoBaseCentavos,
        },
      });

      let i = 0;
      for (const v of dto.variacoes) {
        i++;
        const codigoGrade = `${codigo}-${String(i).padStart(2, '0')}`;
        const base12 = '2' + String(seq).padStart(8, '0') + String(i).padStart(3, '0');
        const codigoBarras = v.codigoBarras?.trim() || ean13(base12);
        await tx.variacao.create({
          data: {
            tenantId,
            produtoId: produto.id,
            cor: v.cor,
            tamanho: v.tamanho,
            skuInterno: codigoGrade,
            codigoBarras,
          },
        });
      }

      return tx.produto.findUnique({
        where: { id: produto.id },
        include: { variacoes: { orderBy: [{ cor: 'asc' }, { tamanho: 'asc' }] } },
      });
    });
  }
}
