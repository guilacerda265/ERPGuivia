import { Injectable, NotFoundException } from '@nestjs/common';
import type { ConfigCrediarioInput, CriarCliente } from '@erp/shared';
import { PrismaService } from '../prisma/prisma.service';

export const CONFIG_CREDIARIO_PADRAO = {
  exigeCpf: true,
  exigeTelefone: true,
  exigeEndereco: false,
  exigeNascimento: false,
};

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(tenantId: string) {
    const clientes = await this.prisma.cliente.findMany({
      where: { tenantId },
      orderBy: { nome: 'asc' },
      include: { contasReceber: { where: { status: 'ABERTA' } } },
    });
    return clientes.map(({ contasReceber, ...c }) => ({
      ...c,
      saldoDevedorCentavos: contasReceber.reduce((s, r) => s + r.valorTotalCentavos, 0),
    }));
  }

  async obter(tenantId: string, id: string) {
    const c = await this.prisma.cliente.findFirst({ where: { id, tenantId } });
    if (!c) throw new NotFoundException('Cliente não encontrado.');
    return c;
  }

  criar(tenantId: string, dto: CriarCliente) {
    return this.prisma.cliente.create({ data: { tenantId, ...this.dados(dto) } });
  }

  async atualizar(tenantId: string, id: string, dto: CriarCliente) {
    await this.prisma.cliente.updateMany({ where: { id, tenantId }, data: this.dados(dto) });
    return this.obter(tenantId, id);
  }

  private dados(dto: CriarCliente) {
    return {
      nome: dto.nome,
      telefone: dto.telefone,
      email: dto.email,
      documento: dto.documento,
      dataNascimento: dto.dataNascimento,
      cep: dto.cep,
      logradouro: dto.logradouro,
      numero: dto.numero,
      complemento: dto.complemento,
      bairro: dto.bairro,
      cidade: dto.cidade,
      uf: dto.uf,
      limiteCreditoCentavos: dto.limiteCreditoCentavos ?? 0,
      observacao: dto.observacao,
    };
  }

  async getConfig(tenantId: string) {
    const c = await this.prisma.configCrediario.findUnique({ where: { tenantId } });
    return c ?? { tenantId, ...CONFIG_CREDIARIO_PADRAO };
  }

  atualizarConfig(tenantId: string, dto: ConfigCrediarioInput) {
    return this.prisma.configCrediario.upsert({
      where: { tenantId },
      create: { tenantId, ...dto },
      update: dto,
    });
  }
}
