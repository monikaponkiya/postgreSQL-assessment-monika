import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  LOGIN_PASSWORD,
  TENANT_ALREADY_EXIST,
  TENANT_NOT_FOUND,
} from 'src/common/constants/response.constants';
import { statusBadRequest } from 'src/common/constants/response.status.constant';
import { UserRole } from 'src/common/constants/user-role';
import { Tenant } from 'src/common/entities/tenant';
import { AuthExceptions } from 'src/common/helpers/exceptions/auth.exception';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { EmailService } from 'src/email/email.service';
import { welcomeTemplate } from 'src/email/emailTemplates/welcome';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
    private userService: UserService,
    private emailService: EmailService,
  ) {}

  async createTenant(tenant: CreateTenantDto) {
    try {
      const existTenant = await this.tenantRepo.findOneBy({
        name: tenant.name,
      });

      if (existTenant) {
        throw AuthExceptions.customException(
          TENANT_ALREADY_EXIST,
          statusBadRequest,
        );
      }
      const createdTenant = await this.tenantRepo.save(tenant);
      // Create admin for tenant
      const randomPassword = Math.random().toString(36).slice(-8);
      const adminObj = {
        name: `Admin ${createdTenant.name}`,
        email: tenant.company_email,
        phone: '8153848585',
        password: randomPassword,
        role: UserRole.ADMIN,
        address: '',
        tenantId: createdTenant.id,
      };
      const createdAdmin = await this.userService.createUser(
        adminObj,
        createdTenant.id,
      );
      await this.emailService.emailSender(
        createdAdmin.email.toLowerCase(),
        LOGIN_PASSWORD,
        `${welcomeTemplate(createdAdmin, adminObj.password)}`,
      );
      return createdTenant;
    } catch (error) {
      throw AuthExceptions.customException(
        error?.response?.message,
        error?.status,
      );
    }
  }

  async updateTenant(id: number, tenant: UpdateTenantDto) {
    try {
      const existTenant = await this.tenantRepo.findOneBy({
        id,
      });
      if (!existTenant) {
        throw AuthExceptions.customException(
          TENANT_NOT_FOUND,
          statusBadRequest,
        );
      }
      existTenant.name = tenant.name;
      return await this.tenantRepo.save(existTenant);
    } catch (error) {
      throw AuthExceptions.customException(
        error?.response?.message,
        error?.status,
      );
    }
  }

  async findTenantById(id: number) {
    try {
      const existTenant = await this.tenantRepo.findOneBy({
        id,
      });
      if (!existTenant) {
        throw AuthExceptions.customException(
          TENANT_NOT_FOUND,
          statusBadRequest,
        );
      }
      return await this.tenantRepo
        .createQueryBuilder('tenant')
        .leftJoinAndSelect('tenant.users', 'users')
        .leftJoinAndSelect('tenant.products', 'products')
        .where('tenant.id = :id', { id })
        .select([
          'tenant',
          'users.id',
          'users.name',
          'users.email',
          'users.phone',
          'users.address',
          'users.role',
          'products.id',
          'products.name',
          'products.description',
          'products.price',
        ])
        .getOne();
    } catch (error) {
      throw AuthExceptions.customException(
        error?.response?.message,
        error?.status,
      );
    }
  }

  async findAllTenants() {
    try {
      return await this.tenantRepo
        .createQueryBuilder('tenant')
        .leftJoinAndSelect('tenant.users', 'users')
        .leftJoinAndSelect('tenant.products', 'products')
        .select([
          'tenant',
          'users.id',
          'users.name',
          'users.email',
          'users.phone',
          'users.address',
          'users.role',
          'products.id',
          'products.name',
          'products.description',
          'products.price',
        ])
        .getMany();
    } catch (error) {
      throw AuthExceptions.customException(
        error?.response?.message,
        error?.status,
      );
    }
  }

  async deleteTenant(id: number) {
    try {
      const existTenant = await this.tenantRepo.findOneBy({
        id,
      });
      if (!existTenant) {
        throw AuthExceptions.customException(
          TENANT_NOT_FOUND,
          statusBadRequest,
        );
      }
      return await this.tenantRepo.remove(existTenant);
    } catch (error) {
      throw AuthExceptions.customException(
        error?.response?.message,
        error?.status,
      );
    }
  }
}
