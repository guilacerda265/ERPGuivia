import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@Module({
  controllers: [CustomersController],
  providers: [CustomersService, JwtAuthGuard],
})
export class CustomersModule {}
