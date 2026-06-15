import { Module } from '@nestjs/common';
import { ReceivablesController } from './receivables.controller';
import { ReceivablesService } from './receivables.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@Module({
  controllers: [ReceivablesController],
  providers: [ReceivablesService, JwtAuthGuard],
})
export class ReceivablesModule {}
