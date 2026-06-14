import { BadRequestException, Injectable } from '@nestjs/common';
import type { LancamentoCaixaInput } from '@erp/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CashierService {
  constructor(private readonly prisma: PrismaService) {}

  sessaoAtual(tenantId: string, lojaId: string) {
    return this.prisma.sessaoCaixa.findFirst({
      where: { tenantId, lojaId, status: 'ABERTA' },
      orderBy: { abertaEm: 'desc' },
    });
  }

  async abrir(tenantId: string, lojaId: string, usuarioId: string, valorAberturaCentavos: number) {
    if (!lojaId) throw new BadRequestException('Loja não definida no token.');
    if (await this.sessaoAtual(tenantId, lojaId)) {
      throw new BadRequestException('Já existe um caixa aberto.');
    }
    return this.prisma.sessaoCaixa.create({
      data: { tenantId, lojaId, valorAberturaCentavos, abertaPor: usuarioId },
    });
  }

  async fechar(tenantId: string, lojaId: string, usuarioId: string, valorInformadoCentavos: number) {
    const sessao = await this.sessaoAtual(tenantId, lojaId);
    if (!sessao) throw new BadRequestException('Nenhum caixa aberto para fechar.');

    const { entradas, saidas } = await this.movimentos(tenantId, lojaId, sessao.abertaEm);
    const calculado = sessao.valorAberturaCentavos + entradas - saidas;

    return this.prisma.sessaoCaixa.update({
      where: { id: sessao.id },
      data: {
        status: 'FECHADA',
        valorFechamentoInformadoCentavos: valorInformadoCentavos,
        valorFechamentoCalculadoCentavos: calculado,
        diferencaCentavos: valorInformadoCentavos - calculado,
        fechadaPor: usuarioId,
        fechadaEm: new Date(),
      },
    });
  }

  async lancar(tenantId: string, lojaId: string, usuarioId: string, dto: LancamentoCaixaInput) {
    if (!lojaId) throw new BadRequestException('Loja não definida no token.');
    const sessao = await this.sessaoAtual(tenantId, lojaId);
    return this.prisma.lancamentoCaixa.create({
      data: {
        tenantId,
        lojaId,
        sessaoCaixaId: sessao?.id,
        tipo: dto.tipo,
        categoria: dto.categoria,
        valorCentavos: dto.valorCentavos,
        descricao: dto.descricao,
        usuarioId,
      },
    });
  }

  private async movimentos(tenantId: string, lojaId: string, desde: Date) {
    const lancs = await this.prisma.lancamentoCaixa.findMany({
      where: { tenantId, lojaId, data: { gte: desde } },
    });
    const entradas = lancs.filter((l) => l.tipo === 'ENTRADA').reduce((s, l) => s + l.valorCentavos, 0);
    const saidas = lancs.filter((l) => l.tipo === 'SAIDA').reduce((s, l) => s + l.valorCentavos, 0);
    return { entradas, saidas, lancs };
  }

  async resumo(tenantId: string, lojaId: string) {
    if (!lojaId) throw new BadRequestException('Loja não definida no token.');
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);

    const sessao = await this.sessaoAtual(tenantId, lojaId);
    const desde = sessao?.abertaEm ?? inicioDia;

    const [lancs, formas] = await Promise.all([
      this.prisma.lancamentoCaixa.findMany({
        where: { tenantId, lojaId, data: { gte: desde } },
        orderBy: { data: 'desc' },
      }),
      this.prisma.formaPagamento.findMany({ where: { tenantId } }),
    ]);
    const nomeForma = new Map(formas.map((f) => [f.id, f.nome]));

    const entradas = lancs.filter((l) => l.tipo === 'ENTRADA').reduce((s, l) => s + l.valorCentavos, 0);
    const saidas = lancs.filter((l) => l.tipo === 'SAIDA').reduce((s, l) => s + l.valorCentavos, 0);
    const abertura = sessao?.valorAberturaCentavos ?? 0;

    const porFormaMap: Record<string, number> = {};
    for (const l of lancs) {
      if (l.tipo === 'ENTRADA' && l.formaPagamentoId) {
        porFormaMap[l.formaPagamentoId] = (porFormaMap[l.formaPagamentoId] ?? 0) + l.valorCentavos;
      }
    }

    return {
      sessaoAberta: sessao
        ? { id: sessao.id, valorAberturaCentavos: abertura, abertaEm: sessao.abertaEm }
        : null,
      entradasCentavos: entradas,
      saidasCentavos: saidas,
      saldoCentavos: abertura + entradas - saidas,
      porForma: Object.entries(porFormaMap).map(([id, valor]) => ({
        forma: nomeForma.get(id) ?? 'Outro',
        valorCentavos: valor,
      })),
      lancamentos: lancs.slice(0, 30).map((l) => ({
        id: l.id,
        tipo: l.tipo,
        categoria: l.categoria,
        valorCentavos: l.valorCentavos,
        descricao: l.descricao,
        data: l.data,
        forma: l.formaPagamentoId ? (nomeForma.get(l.formaPagamentoId) ?? null) : null,
      })),
    };
  }
}
