import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { receberParcelaSchema, type ReceberParcela } from '@erp/shared';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../common/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ReceivablesService } from './receivables.service';

@UseGuards(JwtAuthGuard)
@Controller('contas-receber')
export class ReceivablesController {
  constructor(private readonly receivables: ReceivablesService) {}

  @Get()
  listar(@CurrentUser() u: AuthUser) {
    return this.receivables.listarParcelasAbertas(u.tenantId, u.lojaId ?? '');
  }

  @Post('parcelas/:id/receber')
  receber(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(receberParcelaSchema)) dto: ReceberParcela,
  ) {
    return this.receivables.receber(u.tenantId, u.lojaId ?? '', u.userId, id, dto.formaPagamentoId);
  }
}
