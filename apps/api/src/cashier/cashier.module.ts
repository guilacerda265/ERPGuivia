import { Module } from '@nestjs/common';
import { CashierController } from './cashier.controller';
import { CashierService } from './cashier.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@Module({
  controllers: [CashierController],
  providers: [CashierService, JwtAuthGuard],
})
export class CashierModule {}
