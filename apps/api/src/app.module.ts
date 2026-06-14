import { Controller, Get, Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { IdentityModule } from './identity/identity.module';
import { CatalogModule } from './catalog/catalog.module';
import { InventoryModule } from './inventory/inventory.module';

@Controller('health')
class HealthController {
  @Get()
  check() {
    return { ok: true, service: 'erp-moda-api', onda: 1 };
  }
}

@Module({
  imports: [PrismaModule, IdentityModule, CatalogModule, InventoryModule],
  controllers: [HealthController],
})
export class AppModule {}
