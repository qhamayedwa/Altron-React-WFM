import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationController } from './controllers/organization.controller';
import { OrganizationService } from './services/organization.service';
import { AuthModule } from '../auth/auth.module';
import { Company } from '../entities/company.entity';
import { Region } from '../entities/region.entity';
import { Site } from '../entities/site.entity';
import { Department } from '../entities/department.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, Region, Site, Department, User]),
    AuthModule,
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
