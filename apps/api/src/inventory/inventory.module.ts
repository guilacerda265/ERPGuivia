import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@Module({
  controllers: [InventoryController],
  providers: [InventoryService, JwtAuthGuard],
})
export class InventoryModule {}
