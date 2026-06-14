import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /** "Sua loja hoje" — os números-chave do dashboard. */
  async resumo(tenantId: string, lojaId: string) {
    if (!lojaId) throw new BadRequestException('Loja não definida no token.');

    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const [vendasHoje, faturamentoMes, sessao, lancsHoje, acabando] = await Promise.all([
      this.prisma.venda.aggregate({
        where: { tenantId, lojaId, status: 'CONCLUIDA', createdAt: { gte: inicioDia } },
        _sum: { totalCentavos: true },
        _count: true,
      }),
      this.prisma.venda.aggregate({
        where: { tenantId, lojaId, status: 'CONCLUIDA', createdAt: { gte: inicioMes } },
        _sum: { totalCentavos: true },
      }),
      this.prisma.sessaoCaixa.findFirst({ where: { tenantId, lojaId, status: 'ABERTA' } }),
      this.prisma.lancamentoCaixa.findMany({ where: { tenantId, lojaId, data: { gte: inicioDia } } }),
      this.prisma.saldoEstoque.count({ where: { tenantId, lojaId, quantidade: { gt: 0, lte: 3 } } }),
    ]);

    // dinheiro no caixa: consistente com a tela de Caixa — base na abertura da sessão
    const desde = sessao?.abertaEm ?? inicioDia;
    const lancsSessao = lancsHoje.filter((l) => l.data >= desde);
    const entradas = lancsSessao.filter((l) => l.tipo === 'ENTRADA').reduce((s, l) => s + l.valorCentavos, 0);
    const saidas = lancsSessao.filter((l) => l.tipo === 'SAIDA').reduce((s, l) => s + l.valorCentavos, 0);
    const dinheiroCaixa = (sessao?.valorAberturaCentavos ?? 0) + entradas - saidas;

    return {
      vendasHojeCentavos: vendasHoje._sum.totalCentavos ?? 0,
      vendasHojeQtd: vendasHoje._count,
      faturamentoMesCentavos: faturamentoMes._sum.totalCentavos ?? 0,
      dinheiroCaixaCentavos: dinheiroCaixa,
      produtosAcabando: acabando,
      caixaAberto: !!sessao,
    };
  }
}
