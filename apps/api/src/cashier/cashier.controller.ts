import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  abrirCaixaSchema,
  fecharCaixaSchema,
  lancamentoCaixaSchema,
  type AbrirCaixa,
  type FecharCaixa,
  type LancamentoCaixaInput,
} from '@erp/shared';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../common/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CashierService } from './cashier.service';

@UseGuards(JwtAuthGuard)
@Controller('caixa')
export class CashierController {
  constructor(private readonly cashier: CashierService) {}

  @Get('resumo')
  resumo(@CurrentUser() u: AuthUser) {
    return this.cashier.resumo(u.tenantId, u.lojaId ?? '');
  }

  @Post('abrir')
  abrir(@CurrentUser() u: AuthUser, @Body(new ZodValidationPipe(abrirCaixaSchema)) dto: AbrirCaixa) {
    return this.cashier.abrir(u.tenantId, u.lojaId ?? '', u.userId, dto.valorAberturaCentavos);
  }

  @Post('fechar')
  fechar(@CurrentUser() u: AuthUser, @Body(new ZodValidationPipe(fecharCaixaSchema)) dto: FecharCaixa) {
    return this.cashier.fechar(u.tenantId, u.lojaId ?? '', u.userId, dto.valorFechamentoInformadoCentavos);
  }

  @Post('lancamentos')
  lancar(
    @CurrentUser() u: AuthUser,
    @Body(new ZodValidationPipe(lancamentoCaixaSchema)) dto: LancamentoCaixaInput,
  ) {
    return this.cashier.lancar(u.tenantId, u.lojaId ?? '', u.userId, dto);
  }
}
