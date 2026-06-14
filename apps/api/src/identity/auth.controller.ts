import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { criarContaSchema, loginSchema, type CriarConta, type Login } from '@erp/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../common/current-user.decorator';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('registrar')
  registrar(@Body(new ZodValidationPipe(criarContaSchema)) dto: CriarConta) {
    return this.auth.registrar(dto);
  }

  @Post('login')
  login(@Body(new ZodValidationPipe(loginSchema)) dto: Login) {
    return this.auth.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('eu')
  eu(@CurrentUser() user: AuthUser) {
    return this.auth.eu(user.userId);
  }
}
