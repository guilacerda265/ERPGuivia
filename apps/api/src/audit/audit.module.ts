import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { AuditInterceptor } from './audit.interceptor';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@Module({
  controllers: [AuditController],
  providers: [
    AuditService,
    JwtAuthGuard,
    // interceptor global: registra toda escrita
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AuditModule {}
