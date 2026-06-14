import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const header: string | undefined = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Faça login para continuar.');
    }
    try {
      const payload = this.jwt.verify(header.slice(7));
      req.user = {
        userId: payload.sub,
        tenantId: payload.tenantId,
        papel: payload.papel,
        lojaId: payload.lojaId,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Sessão expirada. Entre novamente.');
    }
  }
}
