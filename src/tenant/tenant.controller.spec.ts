import { Test, TestingModule } from '@nestjs/testing';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import {
  CreateTenantResponseDto,
  TenantDeleteResponseDto,
  TenantDetailResponseDto,
  TenantListResponseDto,
  UpdateTenantResponseDto,
} from './dto/tenant-response.dto';
import {
  TENANT_CREATE,
  TENANT_DELETE,
  TENANT_DETAIL,
  TENANT_LIST,
  TENANT_NOT_FOUND,
  TENANT_UPDATE,
} from 'src/common/constants/response.constants';
import {
  statusCreated,
  statusOk,
} from 'src/common/constants/response.status.constant';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { ListDto } from 'src/common/dto/list.dto';

describe('TenantController', () => {
  let controller: TenantController;
  let service: TenantService;

  const mockTenantService = {
    createTenant: jest.fn(),
    updateTenant: jest.fn(),
    findAllTenants: jest.fn(),
    findTenantDetail: jest.fn(),
    deleteTenant: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantController],
      providers: [{ provide: TenantService, useValue: mockTenantService }],
    }).compile();

    controller = module.get<TenantController>(TenantController);
    service = module.get<TenantService>(TenantService);
  });

  const createTenantDto: CreateTenantDto = {
    name: 'Test Tenant',
    company_email: 'k5LpY@example.com',
    company_phone: '1234567890',
  };

  const updateTenantDto: UpdateTenantDto = {
    name: 'Test Tenant',
  };

  const listDto: ListDto = {
    page: 1,
    limit: 10,
    search: 'test',
    sortBy: 'name',
    sortOrder: 'asc',
  };

  const id = 1;

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a tenant and return the response', async () => {
      const result: CreateTenantResponseDto = {
        data: {
          id: 1,
          name: 'Test Tenant',
          createdAt: '2022-01-01T00:00:00.000Z',
          updatedAt: '2022-01-01T00:00:00.000Z',
        },
        message: TENANT_CREATE,
        statusCode: statusCreated,
      };

      mockTenantService.createTenant.mockResolvedValue(result);

      expect(await controller.create(createTenantDto)).toBe(result);
      expect(mockTenantService.createTenant).toHaveBeenCalledWith(
        createTenantDto,
      );
      expect(service.createTenant).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const error = new Error('An error occurred');

      mockTenantService.createTenant.mockRejectedValue(error);

      await expect(controller.create(createTenantDto)).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    it('should update a tenant and return the response', async () => {
      const result: UpdateTenantResponseDto = {
        data: {
          id: 1,
          name: 'Test Tenant',
          createdAt: '2022-01-01T00:00:00.000Z',
          updatedAt: '2022-01-01T00:00:00.000Z',
        },
        message: TENANT_UPDATE,
        statusCode: statusOk,
      };

      mockTenantService.updateTenant.mockResolvedValue(result);

      expect(await controller.update(id, updateTenantDto)).toBe(result);
      expect(mockTenantService.updateTenant).toHaveBeenCalledWith(
        id,
        updateTenantDto,
      );
      expect(service.updateTenant).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const error = new Error('An error occurred');

      mockTenantService.updateTenant.mockRejectedValue(error);

      await expect(controller.update(id, updateTenantDto)).rejects.toThrow(
        error,
      );
    });

    it('should validate the id parameter', async () => {
      const invalidId = 'invalid';
      const updateTenantDto: UpdateTenantDto = {
        name: 'Test Tenant',
      };

      await expect(
        controller.update(Number(invalidId), updateTenantDto),
      ).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('should return tenant details for a valid id', async () => {
      const result: TenantDetailResponseDto = {
        data: {
          id: 1,
          name: 'Test Tenant',
          createdAt: '2022-01-01T00:00:00.000Z',
          updatedAt: '2022-01-01T00:00:00.000Z',
        },
        message: TENANT_DETAIL,
        statusCode: statusOk,
      };

      mockTenantService.findTenantDetail.mockResolvedValue(result);

      expect(await controller.findById(id)).toBe(result);
      expect(mockTenantService.findTenantDetail).toHaveBeenCalledWith(id);
    });

    it('should handle errors', async () => {
      const error = new Error(TENANT_NOT_FOUND);

      mockTenantService.findTenantDetail.mockRejectedValue(error);

      await expect(controller.findById(id)).rejects.toThrow(error);
    });

    it('should handle invalid id', async () => {
      const invalidId = 'invalid';
      const error = new Error(TENANT_NOT_FOUND);

      await expect(controller.findById(Number(invalidId))).rejects.toThrow(
        error,
      );
    });
  });

  describe('findAll', () => {
    it('should return a list of tenants', async () => {
      const result: TenantListResponseDto = {
        data: [
          {
            id: 1,
            name: 'Test Tenant',
            createdAt: '2022-01-01T00:00:00.000Z',
            updatedAt: '2022-01-01T00:00:00.000Z',
          },
        ],
        message: TENANT_LIST,
        statusCode: statusOk,
      };

      mockTenantService.findAllTenants.mockResolvedValue(result);

      expect(await controller.findAll(listDto)).toBe(result);
      expect(mockTenantService.findAllTenants).toHaveBeenCalledWith(listDto);
    });

    it('should handle errors', async () => {
      const error = new Error('Error fetching tenants');

      mockTenantService.findAllTenants.mockRejectedValue(error);

      await expect(controller.findAll(listDto)).rejects.toThrow(error);
    });
  });

  describe('delete', () => {
    it('should delete a tenant and return the response', async () => {
      const result: TenantDeleteResponseDto = {
        statusCode: statusOk,
        message: TENANT_DELETE,
      };

      mockTenantService.deleteTenant.mockResolvedValue(result);

      expect(await controller.delete(id)).toBe(result);
      expect(mockTenantService.deleteTenant).toHaveBeenCalledWith(id);
    });

    it('should handle errors', async () => {
      const error = new Error(TENANT_NOT_FOUND);

      mockTenantService.deleteTenant.mockRejectedValue(error);

      await expect(controller.delete(id)).rejects.toThrow(error);
    });

    it('should handle invalid id', async () => {
      const invalidId = 'invalid';
      const error = new Error(TENANT_NOT_FOUND);

      await expect(controller.delete(Number(invalidId))).rejects.toThrow(error);
    });
  });
});
