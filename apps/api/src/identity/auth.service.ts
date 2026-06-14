import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import type { CriarConta, Login } from '@erp/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /** Onboarding: cria conta (tenant) + loja + dono + formas de pagamento padrão. */
  async registrar(dto: CriarConta) {
    if (dto.email) {
      const jaExiste = await this.prisma.usuario.findFirst({ where: { email: dto.email } });
      if (jaExiste) {
        throw new ConflictException('Esse e-mail já tem uma conta. Tente entrar.');
      }
    }
    const senhaHash = await bcrypt.hash(dto.senha, 10);

    const { usuario, loja } = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({ data: { nomeNegocio: dto.nomeNegocio } });
      const loja = await tx.loja.create({
        data: { tenantId: tenant.id, nome: 'Loja principal' },
      });
      await tx.configFiscal.create({ data: { lojaId: loja.id } });
      const usuario = await tx.usuario.create({
        data: {
          tenantId: tenant.id,
          nome: dto.nomeUsuario,
          email: dto.email,
          telefone: dto.telefone,
          senhaHash,
          papel: 'DONO',
        },
      });
      await tx.formaPagamento.createMany({
        data: [
          { tenantId: tenant.id, nome: 'Dinheiro', tipo: 'DINHEIRO' },
          { tenantId: tenant.id, nome: 'Pix', tipo: 'PIX' },
          { tenantId: tenant.id, nome: 'Débito', tipo: 'DEBITO' },
          { tenantId: tenant.id, nome: 'Crédito', tipo: 'CREDITO' },
        ],
      });
      return { usuario, loja };
    });

    return this.comToken(usuario, loja.id);
  }

  async login(dto: Login) {
    const usuario = await this.prisma.usuario.findFirst({
      where: {
        status: 'ativo',
        OR: [{ email: dto.identificador }, { telefone: dto.identificador }],
      },
    });
    if (!usuario) throw new UnauthorizedException('Conta não encontrada.');

    const senhaOk = await bcrypt.compare(dto.senha, usuario.senhaHash);
    if (!senhaOk) throw new UnauthorizedException('Senha incorreta.');

    const loja = await this.prisma.loja.findFirst({ where: { tenantId: usuario.tenantId } });
    return this.comToken(usuario, loja?.id);
  }

  async eu(userId: string) {
    const u = await this.prisma.usuario.findUnique({ where: { id: userId } });
    if (!u) throw new UnauthorizedException();
    return { id: u.id, nome: u.nome, email: u.email, papel: u.papel, tenantId: u.tenantId };
  }

  private comToken(
    usuario: { id: string; tenantId: string; papel: string; nome: string; email: string | null },
    lojaId: string | undefined,
  ) {
    const token = this.jwt.sign({
      sub: usuario.id,
      tenantId: usuario.tenantId,
      papel: usuario.papel,
      lojaId,
    });
    return {
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, papel: usuario.papel },
      tenantId: usuario.tenantId,
      lojaId,
    };
  }
}
