import { BadRequestException, Injectable } from '@nestjs/common';
import type { CriarEntrada, CriarFornecedor } from '@erp/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  // ---- fornecedores ----
  listarFornecedores(tenantId: string) {
    return this.prisma.fornecedor.findMany({
      where: { tenantId, status: 'ativo' },
      orderBy: { nome: 'asc' },
    });
  }
  criarFornecedor(tenantId: string, dto: CriarFornecedor) {
    return this.prisma.fornecedor.create({
      data: { tenantId, nome: dto.nome, documento: dto.documento, contato: dto.contato },
    });
  }

  /**
   * Entrada de mercadoria: cria a EntradaEstoque, grava um MovimentoEstoque(ENTRADA)
   * por item (ledger) e atualiza o SaldoEstoque (cache) — tudo numa transação com tenant.
   */
  async criarEntrada(tenantId: string, lojaId: string, dto: CriarEntrada) {
    if (!lojaId) throw new BadRequestException('Loja não definida no token.');

    return this.prisma.comTenant(tenantId, async (tx) => {
      const entrada = await tx.entradaEstoque.create({
        data: {
          tenantId,
          lojaId,
          fornecedorId: dto.fornecedorId,
          numeroNota: dto.numeroNota,
          observacao: dto.observacao,
        },
      });

      for (const item of dto.itens) {
        await tx.movimentoEstoque.create({
          data: {
            tenantId,
            lojaId,
            variacaoId: item.variacaoId,
            tipo: 'ENTRADA',
            quantidade: item.quantidade, // positivo
            custoUnitarioCentavos: item.custoUnitarioCentavos,
            entradaId: entrada.id,
            origemTipo: 'ENTRADA',
            origemId: entrada.id,
          },
        });
        await tx.saldoEstoque.upsert({
          where: { lojaId_variacaoId: { lojaId, variacaoId: item.variacaoId } },
          create: { tenantId, lojaId, variacaoId: item.variacaoId, quantidade: item.quantidade },
          update: { quantidade: { increment: item.quantidade } },
        });
      }

      return tx.entradaEstoque.findUnique({
        where: { id: entrada.id },
        include: { movimentos: true },
      });
    });
  }

  /** Saldo atual por produto/variação na loja. */
  async listarSaldo(tenantId: string, lojaId: string) {
    if (!lojaId) throw new BadRequestException('Loja não definida no token.');

    const produtos = await this.prisma.produto.findMany({
      where: { tenantId, status: 'ativo' },
      orderBy: { nome: 'asc' },
      include: {
        variacoes: {
          where: { ativo: true },
          orderBy: [{ cor: 'asc' }, { tamanho: 'asc' }],
          include: { saldos: { where: { lojaId } } },
        },
      },
    });

    return produtos.map((p) => {
      const variacoes = p.variacoes.map((v) => ({
        variacaoId: v.id,
        cor: v.cor,
        tamanho: v.tamanho,
        quantidade: v.saldos[0]?.quantidade ?? 0,
      }));
      return {
        produtoId: p.id,
        nome: p.nome,
        total: variacoes.reduce((s, v) => s + v.quantidade, 0),
        variacoes,
      };
    });
  }
}
