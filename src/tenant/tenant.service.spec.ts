import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  TENANT_ALREADY_EXIST,
  TENANT_NOT_FOUND,
} from 'src/common/constants/response.constants';
import { statusBadRequest } from 'src/common/constants/response.status.constant';
import { UserRole } from 'src/common/constants/user-role';
import { ListDto } from 'src/common/dto/list.dto';
import { Tenant } from 'src/common/entities/tenant';
import { AuthExceptions } from 'src/common/helpers/exceptions/auth.exception';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantService } from './tenant.service';

describe('TenantService', () => {
  let service: TenantService;
  let tenantRepo: Repository<Tenant>;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        {
          provide: getRepositoryToken(Tenant),
          useValue: {
            save: jest.fn(),
            findOneBy: jest.fn(),
            createQueryBuilder: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            createUser: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
    tenantRepo = module.get<Repository<Tenant>>(getRepositoryToken(Tenant));
    userService = module.get<UserService>(UserService);
  });

  const createTenantDto: CreateTenantDto = {
    name: 'TenantName',
    company_email: 'contact@company.com',
    company_phone: '1234567890',
  };
  const tenantId = 1;
  const updateTenantDto: UpdateTenantDto = { name: 'Updated Name' };
  const existingTenant = { id: tenantId, name: 'Old Name' };
  const tenantToDelete = { id: tenantId, name: 'TenantName' } as Tenant;

  const body: ListDto = {
    page: 1,
    limit: 10,
    search: '',
    sortBy: '',
    sortOrder: '',
  };

  const tenants = [
    {
      id: 1,
      name: 'Tenant 1',
      users: [
        {
          id: 1,
          name: 'User 1',
          email: 'user1@example.com',
          phone: '1234567890',
          address: 'Address 1',
          role: 'ADMIN',
        },
      ],
      products: [
        { id: 1, name: 'Product 1', description: 'Description 1', price: 100 },
      ],
    },
  ];
  const total = 2;

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTenant', () => {
    it('should successfully create a tenant and an admin user', async () => {
      const existingTenant = null;
      const createdTenant = { id: 1, ...createTenantDto };

      jest.spyOn(tenantRepo, 'findOneBy').mockResolvedValue(existingTenant);
      jest.spyOn(tenantRepo, 'save').mockResolvedValue(createdTenant as any);
      jest.spyOn(userService, 'createUser').mockResolvedValue(undefined);

      const result = await service.createTenant(createTenantDto);

      expect(result).toEqual(createdTenant);
      expect(tenantRepo.findOneBy).toHaveBeenCalledWith({
        name: createTenantDto.name,
      });
      expect(tenantRepo.save).toHaveBeenCalledWith(createTenantDto);
      expect(userService.createUser).toHaveBeenCalledWith(
        {
          name: `Admin ${createdTenant.name}`,
          email: createTenantDto.company_email,
          phone: createTenantDto.company_phone,
          role: UserRole.ADMIN,
          address: '',
        },
        createdTenant.id,
      );
    });

    it('should throw an exception if the tenant already exists', async () => {
      const existingTenant = { id: 1, ...createTenantDto };

      jest
        .spyOn(tenantRepo, 'findOneBy')
        .mockResolvedValue(existingTenant as any);

      await expect(service.createTenant(createTenantDto)).rejects.toThrow(
        AuthExceptions.customException(TENANT_ALREADY_EXIST, statusBadRequest),
      );

      expect(tenantRepo.findOneBy).toHaveBeenCalledWith({
        name: createTenantDto.name,
      });
      expect(tenantRepo.save).not.toHaveBeenCalled();
      expect(userService.createUser).not.toHaveBeenCalled();
    });

    it('should handle exceptions during tenant creation', async () => {
      jest.spyOn(tenantRepo, 'findOneBy').mockResolvedValue(null);
      jest
        .spyOn(tenantRepo, 'save')
        .mockRejectedValue(new Error('Internal Server Error'));

      await expect(service.createTenant(createTenantDto)).rejects.toThrow(
        AuthExceptions.customException('Internal Server Error', undefined),
      );

      expect(tenantRepo.findOneBy).toHaveBeenCalledWith({
        name: createTenantDto.name,
      });
      expect(tenantRepo.save).toHaveBeenCalledWith(createTenantDto);
      expect(userService.createUser).not.toHaveBeenCalled();
    });

    it('should handle exceptions during user creation', async () => {
      const existingTenant = null;
      const createdTenant = { id: 1, ...createTenantDto };

      jest.spyOn(tenantRepo, 'findOneBy').mockResolvedValue(existingTenant);
      jest.spyOn(tenantRepo, 'save').mockResolvedValue(createdTenant as any);
      jest
        .spyOn(userService, 'createUser')
        .mockRejectedValue(new Error('Internal Server Error'));

      await expect(service.createTenant(createTenantDto)).rejects.toThrow(
        AuthExceptions.customException('Internal Server Error', undefined),
      );

      expect(tenantRepo.findOneBy).toHaveBeenCalledWith({
        name: createTenantDto.name,
      });
      expect(tenantRepo.save).toHaveBeenCalledWith(createTenantDto);
      expect(userService.createUser).toHaveBeenCalledWith(
        {
          name: `Admin ${createdTenant.name}`,
          email: createTenantDto.company_email,
          phone: createTenantDto.company_phone,
          role: UserRole.ADMIN,
          address: '',
        },
        createdTenant.id,
      );
    });
  });

  describe('updateTenant', () => {
    it('should update the tenant successfully', async () => {
      jest
        .spyOn(tenantRepo, 'findOneBy')
        .mockResolvedValue(existingTenant as any);
      jest.spyOn(tenantRepo, 'save').mockResolvedValue({
        ...existingTenant,
        name: updateTenantDto.name,
      } as any);

      const updatedTenant = await service.updateTenant(
        tenantId,
        updateTenantDto,
      );
      expect(updatedTenant.name).toEqual(updateTenantDto.name);
    });

    it('should throw an exception if the tenant does not exist', async () => {
      const updateTenantDto: UpdateTenantDto = { name: 'Updated Name' };

      jest.spyOn(tenantRepo, 'findOneBy').mockResolvedValue(null);

      await expect(
        service.updateTenant(tenantId, updateTenantDto),
      ).rejects.toThrow(
        AuthExceptions.customException(TENANT_NOT_FOUND, 'statusBadRequest'),
      );
    });

    it('should handle exceptions thrown during save', async () => {
      const tenantId = 1;
      const updateTenantDto: UpdateTenantDto = { name: 'Updated Name' };
      const existingTenant = { id: tenantId, name: 'Old Name' };

      jest
        .spyOn(tenantRepo, 'findOneBy')
        .mockResolvedValue(existingTenant as any);
      jest
        .spyOn(tenantRepo, 'save')
        .mockRejectedValue(new Error('Internal Server Error'));

      await expect(
        service.updateTenant(tenantId, updateTenantDto),
      ).rejects.toThrow(
        AuthExceptions.customException('Internal Server Error', undefined),
      );
    });
  });

  describe('findTenantDetail', () => {
    it('should return tenant details with users and products', async () => {
      const tenantDetail = {
        id: tenantId,
        name: 'TenantName',
        users: [
          {
            id: 1,
            name: 'User1',
            email: 'user1@example.com',
            phone: '1234567890',
            address: 'Address1',
            role: 'USER',
          },
        ],
        products: [
          { id: 1, name: 'Product1', description: 'Description1', price: 100 },
        ],
      };

      jest
        .spyOn(service, 'findTenantById')
        .mockResolvedValue(tenantDetail as any);
      jest.spyOn(tenantRepo, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(tenantDetail),
      } as any);

      const result = await service.findTenantDetail(tenantId);
      expect(result).toEqual(tenantDetail);
      expect(service.findTenantById).toHaveBeenCalledWith(tenantId);
      expect(tenantRepo.createQueryBuilder).toHaveBeenCalledWith('tenant');
    });

    it('should throw an exception if tenant is not found', async () => {
      jest.spyOn(service, 'findTenantById').mockResolvedValue(null);

      await expect(service.findTenantDetail(tenantId)).rejects.toThrow(
        AuthExceptions.customException(TENANT_NOT_FOUND, statusBadRequest),
      );

      expect(service.findTenantById).toHaveBeenCalledWith(tenantId);
      expect(tenantRepo.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('should handle and rethrow exceptions during query execution', async () => {
      const tenantMock: Tenant = {
        id: tenantId,
        name: 'TenantName',
        createdAt: new Date(),
        updatedAt: new Date(),
        users: [],
        products: [],
      } as any;
      jest.spyOn(service, 'findTenantById').mockResolvedValue(tenantMock);
      jest.spyOn(tenantRepo, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockRejectedValue(new Error('Internal Server Error')),
      } as any);

      await expect(service.findTenantDetail(tenantId)).rejects.toThrow(
        AuthExceptions.customException('Internal Server Error', undefined),
      );

      expect(service.findTenantById).toHaveBeenCalledWith(tenantId);
      expect(tenantRepo.createQueryBuilder).toHaveBeenCalledWith('tenant');
    });
  });

  describe('deleteTenant', () => {
    it('should successfully delete a tenant', async () => {
      jest.spyOn(service, 'findTenantById').mockResolvedValue(tenantToDelete);
      jest.spyOn(tenantRepo, 'remove').mockResolvedValue(tenantToDelete);

      const result = await service.deleteTenant(tenantId);

      expect(result).toEqual(tenantToDelete);
      expect(service.findTenantById).toHaveBeenCalledWith(tenantId);
      expect(tenantRepo.remove).toHaveBeenCalledWith(tenantToDelete);
    });

    it('should throw an exception if the tenant does not exist', async () => {
      jest.spyOn(service, 'findTenantById').mockResolvedValue(null);

      await expect(service.deleteTenant(tenantId)).rejects.toThrow(
        AuthExceptions.customException(TENANT_NOT_FOUND, statusBadRequest),
      );

      expect(service.findTenantById).toHaveBeenCalledWith(tenantId);
      expect(tenantRepo.remove).not.toHaveBeenCalled();
    });

    it('should handle and rethrow exceptions during deletion', async () => {
      jest.spyOn(service, 'findTenantById').mockResolvedValue(tenantToDelete);
      jest
        .spyOn(tenantRepo, 'remove')
        .mockRejectedValue(new Error('Internal Server Error'));

      await expect(service.deleteTenant(tenantId)).rejects.toThrow(
        AuthExceptions.customException('Internal Server Error', undefined),
      );

      expect(service.findTenantById).toHaveBeenCalledWith(tenantId);
      expect(tenantRepo.remove).toHaveBeenCalledWith(tenantToDelete);
    });
  });

  describe('findAllTenants', () => {
    it('should return a paginated list of tenants with search and sorting', async () => {
      jest.spyOn(tenantRepo, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([tenants, total]),
      } as any);

      const result = await service.findAllTenants(body);

      expect(result).toEqual({
        data: tenants,
        total,
        page: body.page,
        limit: body.limit,
      });
      expect(tenantRepo.createQueryBuilder).toHaveBeenCalledWith('tenant');
    });

    it('should handle pagination correctly', async () => {
      jest.spyOn(tenantRepo, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([tenants, total]),
      } as any);

      const result = await service.findAllTenants(body);

      expect(result.page).toBe(body.page);
      expect(result.limit).toBe(body.limit);
      expect(tenantRepo.createQueryBuilder).toHaveBeenCalledWith('tenant');
    });

    it('should handle errors during the query process', async () => {
      jest.spyOn(tenantRepo, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getManyAndCount: jest
          .fn()
          .mockRejectedValue(new Error('Internal Server Error')),
      } as any);

      await expect(service.findAllTenants(body)).rejects.toThrow(
        AuthExceptions.customException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });
});
