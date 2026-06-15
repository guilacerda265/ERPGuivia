import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import {
  atualizarProdutoSchema,
  criarCategoriaSchema,
  criarColecaoSchema,
  criarDepartamentoSchema,
  criarMarcaSchema,
  criarProdutoSchema,
  type AtualizarProduto,
  type CriarCategoria,
  type CriarColecao,
  type CriarDepartamento,
  type CriarMarca,
  type CriarProduto,
} from '@erp/shared';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../common/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CatalogService } from './catalog.service';

@UseGuards(JwtAuthGuard)
@Controller('catalogo')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('categorias')
  listarCategorias(@CurrentUser() u: AuthUser) {
    return this.catalog.listarCategorias(u.tenantId);
  }
  @Post('categorias')
  criarCategoria(
    @CurrentUser() u: AuthUser,
    @Body(new ZodValidationPipe(criarCategoriaSchema)) dto: CriarCategoria,
  ) {
    return this.catalog.criarCategoria(u.tenantId, dto);
  }
  @Put('categorias/:id')
  atualizarCategoria(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(criarCategoriaSchema)) dto: CriarCategoria,
  ) {
    return this.catalog.atualizarCategoria(u.tenantId, id, dto);
  }

  @Get('marcas')
  listarMarcas(@CurrentUser() u: AuthUser) {
    return this.catalog.listarMarcas(u.tenantId);
  }
  @Post('marcas')
  criarMarca(
    @CurrentUser() u: AuthUser,
    @Body(new ZodValidationPipe(criarMarcaSchema)) dto: CriarMarca,
  ) {
    return this.catalog.criarMarca(u.tenantId, dto);
  }
  @Put('marcas/:id')
  atualizarMarca(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(criarMarcaSchema)) dto: CriarMarca,
  ) {
    return this.catalog.atualizarMarca(u.tenantId, id, dto);
  }

  @Get('colecoes')
  listarColecoes(@CurrentUser() u: AuthUser) {
    return this.catalog.listarColecoes(u.tenantId);
  }
  @Post('colecoes')
  criarColecao(
    @CurrentUser() u: AuthUser,
    @Body(new ZodValidationPipe(criarColecaoSchema)) dto: CriarColecao,
  ) {
    return this.catalog.criarColecao(u.tenantId, dto);
  }
  @Put('colecoes/:id')
  atualizarColecao(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(criarColecaoSchema)) dto: CriarColecao,
  ) {
    return this.catalog.atualizarColecao(u.tenantId, id, dto);
  }

  @Get('departamentos')
  listarDepartamentos(@CurrentUser() u: AuthUser) {
    return this.catalog.listarDepartamentos(u.tenantId);
  }
  @Post('departamentos')
  criarDepartamento(
    @CurrentUser() u: AuthUser,
    @Body(new ZodValidationPipe(criarDepartamentoSchema)) dto: CriarDepartamento,
  ) {
    return this.catalog.criarDepartamento(u.tenantId, dto);
  }
  @Put('departamentos/:id')
  atualizarDepartamento(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(criarDepartamentoSchema)) dto: CriarDepartamento,
  ) {
    return this.catalog.atualizarDepartamento(u.tenantId, id, dto);
  }

  @Get('produtos')
  listarProdutos(@CurrentUser() u: AuthUser) {
    return this.catalog.listarProdutos(u.tenantId);
  }
  @Get('produtos/:id')
  obterProduto(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.catalog.obterProduto(u.tenantId, id);
  }
  @Post('produtos')
  criarProduto(
    @CurrentUser() u: AuthUser,
    @Body(new ZodValidationPipe(criarProdutoSchema)) dto: CriarProduto,
  ) {
    return this.catalog.criarProduto(u.tenantId, dto);
  }
  @Put('produtos/:id')
  atualizarProduto(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(atualizarProdutoSchema)) dto: AtualizarProduto,
  ) {
    return this.catalog.atualizarProduto(u.tenantId, id, dto);
  }
}
