import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from 'src/common/entities/tenant';
import { UserModule } from 'src/user/user.module';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant]), UserModule],
  controllers: [TenantController],
  providers: [TenantService],
})
export class TenantModule {}
