import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../common/current-user.decorator';
import { DashboardService } from './dashboard.service';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get()
  resumo(@CurrentUser() u: AuthUser) {
    return this.dashboard.resumo(u.tenantId, u.lojaId ?? '');
  }
}
