import { Module } from '@nestjs/common';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@Module({
  controllers: [SalesController],
  providers: [SalesService, JwtAuthGuard],
})
export class SalesModule {}
