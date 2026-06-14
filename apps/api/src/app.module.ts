import { Controller, Get, Module } from '@nestjs/common';

@Controller('health')
class HealthController {
  @Get()
  check() {
    return { ok: true, service: 'erp-moda-api', onda: 1 };
  }
}

@Module({
  controllers: [HealthController],
})
export class AppModule {}
