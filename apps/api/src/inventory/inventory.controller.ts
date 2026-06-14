import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  criarEntradaSchema,
  criarFornecedorSchema,
  type CriarEntrada,
  type CriarFornecedor,
} from '@erp/shared';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../common/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { InventoryService } from './inventory.service';

@UseGuards(JwtAuthGuard)
@Controller('estoque')
export class InventoryController {
  constructor(private readonly inventory: InventoryService) {}

  @Get('fornecedores')
  listarFornecedores(@CurrentUser() u: AuthUser) {
    return this.inventory.listarFornecedores(u.tenantId);
  }
  @Post('fornecedores')
  criarFornecedor(
    @CurrentUser() u: AuthUser,
    @Body(new ZodValidationPipe(criarFornecedorSchema)) dto: CriarFornecedor,
  ) {
    return this.inventory.criarFornecedor(u.tenantId, dto);
  }

  @Get('saldo')
  saldo(@CurrentUser() u: AuthUser) {
    return this.inventory.listarSaldo(u.tenantId, u.lojaId ?? '');
  }

  @Post('entradas')
  entrada(
    @CurrentUser() u: AuthUser,
    @Body(new ZodValidationPipe(criarEntradaSchema)) dto: CriarEntrada,
  ) {
    return this.inventory.criarEntrada(u.tenantId, u.lojaId ?? '', dto);
  }
}
