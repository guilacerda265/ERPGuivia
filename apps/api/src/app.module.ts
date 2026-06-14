import { Controller, Get, Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { IdentityModule } from './identity/identity.module';
import { CatalogModule } from './catalog/catalog.module';
import { InventoryModule } from './inventory/inventory.module';
import { SalesModule } from './sales/sales.module';
import { CashierModule } from './cashier/cashier.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Controller('health')
class HealthController {
  @Get()
  check() {
    return { ok: true, service: 'erp-moda-api', onda: 1 };
  }
}

@Module({
  imports: [
    PrismaModule,
    IdentityModule,
    CatalogModule,
    InventoryModule,
    SalesModule,
    CashierModule,
    DashboardModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
