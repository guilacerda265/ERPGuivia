import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReceivablesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Parcelas em aberto da loja, ordenadas por vencimento. */
  async listarParcelasAbertas(tenantId: string, lojaId: string) {
    if (!lojaId) throw new BadRequestException('Loja não definida no token.');
    const parcelas = await this.prisma.parcela.findMany({
      where: { tenantId, status: 'ABERTA', conta: { lojaId } },
      orderBy: { vencimento: 'asc' },
      include: { conta: { include: { cliente: { select: { id: true, nome: true } } } } },
    });
    return parcelas.map((p) => ({
      id: p.id,
      numero: p.numero,
      valorCentavos: p.valorCentavos,
      vencimento: p.vencimento,
      contaId: p.contaReceberId,
      clienteId: p.conta.cliente.id,
      clienteNome: p.conta.cliente.nome,
    }));
  }

  /** Dá baixa numa parcela: marca PAGA, registra recebimento e lança no caixa. */
  async receber(tenantId: string, lojaId: string, usuarioId: string, parcelaId: string, formaPagamentoId?: string) {
    return this.prisma.comTenant(tenantId, async (tx) => {
      const parcela = await tx.parcela.findFirst({ where: { id: parcelaId, tenantId }, include: { conta: true } });
      if (!parcela) throw new NotFoundException('Parcela não encontrada.');
      if (parcela.status === 'PAGA') throw new BadRequestException('Parcela já recebida.');

      await tx.parcela.update({ where: { id: parcelaId }, data: { status: 'PAGA', pagoEm: new Date() } });
      await tx.recebimentoParcela.create({
        data: { tenantId, parcelaId, valorCentavos: parcela.valorCentavos, formaPagamentoId, usuarioId },
      });
      await tx.lancamentoCaixa.create({
        data: {
          tenantId,
          lojaId: parcela.conta.lojaId,
          tipo: 'ENTRADA',
          categoria: 'VENDA',
          valorCentavos: parcela.valorCentavos,
          formaPagamentoId,
          origemTipo: 'CREDIARIO',
          origemId: parcela.id,
          descricao: `Recebimento crediário (parcela ${parcela.numero})`,
          usuarioId,
        },
      });

      const abertas = await tx.parcela.count({ where: { contaReceberId: parcela.contaReceberId, status: 'ABERTA' } });
      if (abertas === 0) {
        await tx.contaReceber.update({ where: { id: parcela.contaReceberId }, data: { status: 'QUITADA' } });
      }
      return { ok: true, contaQuitada: abertas === 0 };
    });
  }
}
