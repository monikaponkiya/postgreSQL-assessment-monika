import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/common/entities/user';
import { JwtService } from '@nestjs/jwt';
import { Tenant } from 'src/common/entities/tenant';

@Module({
  imports: [TypeOrmModule.forFeature([User, Tenant])],
  controllers: [UserController],
  providers: [UserService, JwtService],
  exports: [UserService],
})
export class UserModule {}
