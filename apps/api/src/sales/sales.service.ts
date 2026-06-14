import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { CriarVenda } from '@erp/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  listarFormas(tenantId: string) {
    return this.prisma.formaPagamento.findMany({
      where: { tenantId, ativo: true },
      orderBy: { nome: 'asc' },
    });
  }

  listar(tenantId: string, lojaId: string) {
    return this.prisma.venda.findMany({
      where: { tenantId, lojaId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { itens: true, pagamentos: true },
    });
  }

  /**
   * Venda rápida — A INVARIANTE DE ATOMICIDADE (§3.8 do domínio).
   * Num único prisma.$transaction: cria a venda + itens (snapshot) + pagamentos,
   * baixa o estoque (movimento VENDA + saldo) e alimenta o caixa (lançamento).
   * Tudo ou nada.
   */
  async criarVenda(tenantId: string, lojaId: string, vendedorId: string, dto: CriarVenda) {
    if (!lojaId) throw new BadRequestException('Loja não definida no token.');

    const variacoes = await this.prisma.variacao.findMany({
      where: { id: { in: dto.itens.map((i) => i.variacaoId) }, tenantId },
      include: { produto: true, saldos: { where: { lojaId } } },
    });
    const porId = new Map(variacoes.map((v) => [v.id, v]));

    let subtotal = 0;
    let descontoItens = 0;
    const linhas = dto.itens.map((item) => {
      const v = porId.get(item.variacaoId);
      if (!v) throw new NotFoundException('Produto da venda não encontrado.');
      const precoUnit = v.precoCentavos ?? v.produto.precoBaseCentavos;
      const saldo = v.saldos[0]?.quantidade ?? 0;
      if (!dto.permitirSemEstoque && saldo < item.quantidade) {
        throw new BadRequestException(
          `Sem estoque de ${v.produto.nome} (${v.cor}/${v.tamanho}). Disponível: ${saldo}.`,
        );
      }
      subtotal += precoUnit * item.quantidade;
      descontoItens += item.descontoCentavos;
      return {
        variacaoId: v.id,
        quantidade: item.quantidade,
        precoUnitarioCentavos: precoUnit,
        descontoCentavos: item.descontoCentavos,
        totalCentavos: precoUnit * item.quantidade - item.descontoCentavos,
        produtoNome: v.produto.nome,
        cor: v.cor,
        tamanho: v.tamanho,
      };
    });

    const descontoTotal = descontoItens + dto.descontoCentavos;
    const total = Math.max(0, subtotal - descontoTotal);

    const somaPagamentos = dto.pagamentos.reduce((s, p) => s + p.valorCentavos, 0);
    if (somaPagamentos !== total) {
      throw new BadRequestException(
        `O pagamento (${(somaPagamentos / 100).toFixed(2)}) não bate com o total (${(total / 100).toFixed(2)}).`,
      );
    }

    return this.prisma.comTenant(tenantId, async (tx) => {
      const ultima = await tx.venda.findFirst({
        where: { lojaId },
        orderBy: { numero: 'desc' },
        select: { numero: true },
      });
      const numero = (ultima?.numero ?? 0) + 1;

      const venda = await tx.venda.create({
        data: {
          tenantId,
          lojaId,
          numero,
          status: 'CONCLUIDA',
          clienteId: dto.clienteId,
          vendedorId,
          subtotalCentavos: subtotal,
          descontoCentavos: descontoTotal,
          totalCentavos: total,
        },
      });

      await tx.itemVenda.createMany({ data: linhas.map((l) => ({ ...l, vendaId: venda.id })) });
      await tx.pagamento.createMany({
        data: dto.pagamentos.map((p) => ({
          vendaId: venda.id,
          formaPagamentoId: p.formaPagamentoId,
          valorCentavos: p.valorCentavos,
        })),
      });

      for (const l of linhas) {
        await tx.movimentoEstoque.create({
          data: {
            tenantId,
            lojaId,
            variacaoId: l.variacaoId,
            tipo: 'VENDA',
            quantidade: -l.quantidade, // saída
            origemTipo: 'VENDA',
            origemId: venda.id,
            usuarioId: vendedorId,
          },
        });
        await tx.saldoEstoque.upsert({
          where: { lojaId_variacaoId: { lojaId, variacaoId: l.variacaoId } },
          create: { tenantId, lojaId, variacaoId: l.variacaoId, quantidade: -l.quantidade },
          update: { quantidade: { decrement: l.quantidade } },
        });
      }

      for (const p of dto.pagamentos) {
        await tx.lancamentoCaixa.create({
          data: {
            tenantId,
            lojaId,
            tipo: 'ENTRADA',
            categoria: 'VENDA',
            valorCentavos: p.valorCentavos,
            formaPagamentoId: p.formaPagamentoId,
            origemTipo: 'VENDA',
            origemId: venda.id,
            usuarioId: vendedorId,
          },
        });
      }

      return tx.venda.findUnique({
        where: { id: venda.id },
        include: { itens: true, pagamentos: true },
      });
    });
  }
}
