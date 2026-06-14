import { Injectable, NotFoundException } from '@nestjs/common';
import type { CriarCategoria, CriarColecao, CriarMarca, CriarProduto } from '@erp/shared';
import { PrismaService } from '../prisma/prisma.service';

function slug(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();
}

function gerarSku(nome: string, cor: string, tamanho: string): string {
  return `${slug(nome).slice(0, 6)}-${slug(cor).slice(0, 3)}-${slug(tamanho)}`;
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

  // ---- produtos ----
  listarProdutos(tenantId: string) {
    return this.prisma.produto.findMany({
      where: { tenantId, status: 'ativo' },
      include: {
        categoria: true,
        marca: true,
        colecao: true,
        variacoes: { where: { ativo: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async obterProduto(tenantId: string, id: string) {
    const produto = await this.prisma.produto.findFirst({
      where: { id, tenantId },
      include: { categoria: true, marca: true, colecao: true, variacoes: true },
    });
    if (!produto) throw new NotFoundException('Produto não encontrado.');
    return produto;
  }

  /** Cria o produto e gera a grade (cor × tamanho → variações), em transação com tenant. */
  async criarProduto(tenantId: string, dto: CriarProduto) {
    return this.prisma.comTenant(tenantId, async (tx) => {
      const produto = await tx.produto.create({
        data: {
          tenantId,
          nome: dto.nome,
          categoriaId: dto.categoriaId,
          marcaId: dto.marcaId,
          colecaoId: dto.colecaoId,
          custoCompraCentavos: dto.custoCompraCentavos,
          markupPercentual: dto.markupPercentual,
          precoBaseCentavos: dto.precoBaseCentavos,
        },
      });

      for (const cor of dto.cores) {
        for (const tamanho of dto.tamanhos) {
          await tx.variacao.create({
            data: {
              tenantId,
              produtoId: produto.id,
              cor,
              tamanho,
              skuInterno: gerarSku(dto.nome, cor, tamanho),
            },
          });
        }
      }

      return tx.produto.findUnique({
        where: { id: produto.id },
        include: { variacoes: true },
      });
    });
  }
}
