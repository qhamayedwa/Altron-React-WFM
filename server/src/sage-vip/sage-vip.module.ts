import { Module } from '@nestjs/common';
import { SageVipController } from './sage-vip.controller';
import { SageVipService } from './sage-vip.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SageVipController],
  providers: [SageVipService],
  exports: [SageVipService],
})
export class SageVipModule {}
