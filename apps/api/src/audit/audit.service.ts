import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  listar(tenantId: string, entidade?: string) {
    return this.prisma.auditLog.findMany({
      where: { tenantId, ...(entidade ? { entidade } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { usuario: { select: { nome: true } } },
    });
  }

  async entidades(tenantId: string) {
    const grupos = await this.prisma.auditLog.groupBy({
      by: ['entidade'],
      where: { tenantId },
      orderBy: { entidade: 'asc' },
    });
    return grupos.map((g) => g.entidade);
  }
}
