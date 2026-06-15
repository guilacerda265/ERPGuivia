import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import {
  configCrediarioSchema,
  criarClienteSchema,
  type ConfigCrediarioInput,
  type CriarCliente,
} from '@erp/shared';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../common/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CustomersService } from './customers.service';

@UseGuards(JwtAuthGuard)
@Controller('clientes')
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  // 'config' antes de ':id' para não colidir com o parâmetro
  @Get('config')
  getConfig(@CurrentUser() u: AuthUser) {
    return this.customers.getConfig(u.tenantId);
  }
  @Put('config')
  atualizarConfig(
    @CurrentUser() u: AuthUser,
    @Body(new ZodValidationPipe(configCrediarioSchema)) dto: ConfigCrediarioInput,
  ) {
    return this.customers.atualizarConfig(u.tenantId, dto);
  }

  @Get()
  listar(@CurrentUser() u: AuthUser) {
    return this.customers.listar(u.tenantId);
  }
  @Post()
  criar(@CurrentUser() u: AuthUser, @Body(new ZodValidationPipe(criarClienteSchema)) dto: CriarCliente) {
    return this.customers.criar(u.tenantId, dto);
  }
  @Get(':id')
  obter(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.customers.obter(u.tenantId, id);
  }
  @Put(':id')
  atualizar(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(criarClienteSchema)) dto: CriarCliente,
  ) {
    return this.customers.atualizar(u.tenantId, id, dto);
  }
}
