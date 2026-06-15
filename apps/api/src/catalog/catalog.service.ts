import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  AtualizarProduto,
  CriarCategoria,
  CriarColecao,
  CriarCor,
  CriarDepartamento,
  CriarGrade,
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

/** Extrai o número sequencial do código do produto (P00007 -> 7). */
function seqDoCodigo(codigo: string | null): number {
  return parseInt((codigo ?? '').replace(/\D/g, ''), 10) || 0;
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
  async atualizarCategoria(tenantId: string, id: string, dto: CriarCategoria) {
    await this.prisma.categoria.updateMany({
      where: { id, tenantId },
      data: { nome: dto.nome, tipoModa: dto.tipoModa },
    });
    return this.prisma.categoria.findFirst({ where: { id, tenantId } });
  }

  // ---- marcas ----
  listarMarcas(tenantId: string) {
    return this.prisma.marca.findMany({ where: { tenantId }, orderBy: { nome: 'asc' } });
  }
  criarMarca(tenantId: string, dto: CriarMarca) {
    return this.prisma.marca.create({ data: { tenantId, nome: dto.nome } });
  }
  async atualizarMarca(tenantId: string, id: string, dto: CriarMarca) {
    await this.prisma.marca.updateMany({ where: { id, tenantId }, data: { nome: dto.nome } });
    return this.prisma.marca.findFirst({ where: { id, tenantId } });
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
  async atualizarColecao(tenantId: string, id: string, dto: CriarColecao) {
    await this.prisma.colecao.updateMany({
      where: { id, tenantId },
      data: { nome: dto.nome, ano: dto.ano, estacao: dto.estacao },
    });
    return this.prisma.colecao.findFirst({ where: { id, tenantId } });
  }

  // ---- departamentos ----
  listarDepartamentos(tenantId: string) {
    return this.prisma.departamento.findMany({ where: { tenantId }, orderBy: { nome: 'asc' } });
  }
  criarDepartamento(tenantId: string, dto: CriarDepartamento) {
    return this.prisma.departamento.create({ data: { tenantId, nome: dto.nome } });
  }
  async atualizarDepartamento(tenantId: string, id: string, dto: CriarDepartamento) {
    await this.prisma.departamento.updateMany({ where: { id, tenantId }, data: { nome: dto.nome } });
    return this.prisma.departamento.findFirst({ where: { id, tenantId } });
  }

  // ---- cores ----
  listarCores(tenantId: string) {
    return this.prisma.cor.findMany({ where: { tenantId }, orderBy: { nome: 'asc' } });
  }
  criarCor(tenantId: string, dto: CriarCor) {
    return this.prisma.cor.create({ data: { tenantId, nome: dto.nome, hex: dto.hex } });
  }
  async atualizarCor(tenantId: string, id: string, dto: CriarCor) {
    await this.prisma.cor.updateMany({ where: { id, tenantId }, data: { nome: dto.nome, hex: dto.hex } });
    return this.prisma.cor.findFirst({ where: { id, tenantId } });
  }

  // ---- grades de tamanho ----
  listarGrades(tenantId: string) {
    return this.prisma.gradeTamanho.findMany({ where: { tenantId }, orderBy: { nome: 'asc' } });
  }
  criarGrade(tenantId: string, dto: CriarGrade) {
    return this.prisma.gradeTamanho.create({
      data: { tenantId, nome: dto.nome, tamanhos: dto.tamanhos },
    });
  }
  async atualizarGrade(tenantId: string, id: string, dto: CriarGrade) {
    await this.prisma.gradeTamanho.updateMany({
      where: { id, tenantId },
      data: { nome: dto.nome, tamanhos: dto.tamanhos },
    });
    return this.prisma.gradeTamanho.findFirst({ where: { id, tenantId } });
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

  /** Atualiza os campos do produto e a grade (edita/desativa existentes, cria novas). */
  async atualizarProduto(tenantId: string, id: string, dto: AtualizarProduto) {
    return this.prisma.comTenant(tenantId, async (tx) => {
      const existe = await tx.produto.findFirst({ where: { id, tenantId } });
      if (!existe) throw new NotFoundException('Produto não encontrado.');

      await tx.produto.update({
        where: { id },
        data: {
          nome: dto.nome,
          categoriaId: dto.categoriaId,
          marcaId: dto.marcaId,
          colecaoId: dto.colecaoId,
          departamentoId: dto.departamentoId,
          custoCompraCentavos: dto.custoCompraCentavos,
          markupPercentual: dto.markupPercentual,
          precoBaseCentavos: dto.precoBaseCentavos,
        },
      });

      const seq = seqDoCodigo(existe.codigo);
      let idx = await tx.variacao.count({ where: { produtoId: id } });

      for (const v of dto.variacoes) {
        if (v.id) {
          await tx.variacao.update({
            where: { id: v.id },
            data: {
              ativo: v.ativo,
              ...(v.codigoBarras?.trim() ? { codigoBarras: v.codigoBarras.trim() } : {}),
            },
          });
        } else {
          idx++;
          const codigoGrade = `${existe.codigo ?? 'P'}-${String(idx).padStart(2, '0')}`;
          const base12 = '2' + String(seq).padStart(8, '0') + String(idx).padStart(3, '0');
          await tx.variacao.create({
            data: {
              tenantId,
              produtoId: id,
              cor: v.cor,
              tamanho: v.tamanho,
              skuInterno: codigoGrade,
              codigoBarras: v.codigoBarras?.trim() || ean13(base12),
            },
          });
        }
      }

      return tx.produto.findUnique({
        where: { id },
        include: { variacoes: { orderBy: [{ cor: 'asc' }, { tamanho: 'asc' }] } },
      });
    });
  }
}
