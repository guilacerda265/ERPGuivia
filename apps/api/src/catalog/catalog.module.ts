import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@Module({
  controllers: [CatalogController],
  providers: [CatalogService, JwtAuthGuard],
})
export class CatalogModule {}
