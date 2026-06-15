import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../common/current-user.decorator';
import { AuditService } from './audit.service';

@UseGuards(JwtAuthGuard)
@Controller('auditoria')
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  listar(@CurrentUser() u: AuthUser, @Query('entidade') entidade?: string) {
    return this.audit.listar(u.tenantId, entidade);
  }

  @Get('entidades')
  entidades(@CurrentUser() u: AuthUser) {
    return this.audit.entidades(u.tenantId);
  }
}
