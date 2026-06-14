import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { criarVendaSchema, type CriarVenda } from '@erp/shared';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../common/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { SalesService } from './sales.service';

@UseGuards(JwtAuthGuard)
@Controller('vendas')
export class SalesController {
  constructor(private readonly sales: SalesService) {}

  @Get('formas-pagamento')
  formas(@CurrentUser() u: AuthUser) {
    return this.sales.listarFormas(u.tenantId);
  }

  @Get()
  listar(@CurrentUser() u: AuthUser) {
    return this.sales.listar(u.tenantId, u.lojaId ?? '');
  }

  @Post()
  criar(@CurrentUser() u: AuthUser, @Body(new ZodValidationPipe(criarVendaSchema)) dto: CriarVenda) {
    return this.sales.criarVenda(u.tenantId, u.lojaId ?? '', u.userId, dto);
  }
}
