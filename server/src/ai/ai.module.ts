import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiFallbackService } from './ai-fallback.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AiController],
  providers: [AiService, AiFallbackService],
  exports: [AiService, AiFallbackService],
})
export class AiModule {}
