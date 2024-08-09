import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  TENANT_ALREADY_EXIST,
  TENANT_NOT_FOUND,
} from 'src/common/constants/response.constants';
import { statusBadRequest } from 'src/common/constants/response.status.constant';
import { UserRole } from 'src/common/constants/user-role';
import { ListDto } from 'src/common/dto/list.dto';
import { Tenant } from 'src/common/entities/tenant';
import { AuthExceptions } from 'src/common/helpers/exceptions/auth.exception';
import applyQueryOptions from 'src/common/queryHelper';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
    private userService: UserService,
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
      const adminObj = {
        name: `Admin ${createdTenant.name}`,
        email: tenant.company_email,
        phone: tenant.company_phone,
        role: UserRole.ADMIN,
        address: '',
        tenantId: createdTenant.id,
      };
      const createdAdmin = await this.userService.createUser(
        adminObj,
        createdTenant.id,
      );
      return {
        ...createdTenant,
        admin: createdAdmin,
      };
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

  async findAllTenants(body: ListDto) {
    try {
      const page = body.page ? Number(body.page) : 1;
      const limit = body.limit ? Number(body.limit) : 10;
      const skip = (page - 1) * limit;

      const queryBuilder = this.tenantRepo
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
        ]);

      if (body.search) {
        queryBuilder.andWhere(
          '(tenant.name LIKE :search OR users.name LIKE :search)',
          { search: `%${body.search}%` },
        );
      }

      applyQueryOptions(
        queryBuilder,
        {
          search: body.search,
          sortBy: body.sortBy,
          sortOrder: body.sortOrder,
          skip: skip,
          limit: body.limit,
        },
        'tenant',
      );

      const [tenants, total] = await queryBuilder.getManyAndCount();

      return {
        data: tenants,
        total,
        page,
        limit,
      };
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
