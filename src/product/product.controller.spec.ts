import { Test, TestingModule } from '@nestjs/testing';
import {
  PRODUCT_CREATE,
  PRODUCT_DELETE,
  PRODUCT_DETAIL,
  PRODUCT_LIST,
  PRODUCT_NOT_FOUND,
  PRODUCT_UPDATE,
} from 'src/common/constants/response.constants';
import {
  statusCreated,
  statusOk,
} from 'src/common/constants/response.status.constant';
import { RoleGuard } from 'src/security/guard/role.guard';
import { CreateProductDto } from './dto/create-update-product.dto';
import {
  CreateProductResponseDto,
  ProductDeleteResponseDto,
  UpdateProductResponseDto,
} from './dto/product-response.dto';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ListDto } from 'src/common/dto/list.dto';

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

  const mockProductService = {
    createProduct: jest.fn(),
    updateProduct: jest.fn(),
    getProductList: jest.fn(),
    getProductDetail: jest.fn(),
    deleteProduct: jest.fn(),
  };

  const mockRoleGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
        {
          provide: RoleGuard,
          useValue: mockRoleGuard,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
  });

  const productDto: CreateProductDto = {
    name: 'Test Product',
    description: 'Test Description',
    price: 10.99,
  };

  const productDetailResult = {
    data: {
      id: 1,
      name: 'XYZ Gadget 1',
      description: 'Innovative gadget from XYZ Ltd.',
      price: 120,
      createdAt: '2024-08-08T07:16:43.301Z',
      updatedAt: '2024-08-08T07:16:43.301Z',
      tenant: {
        id: 2,
        name: 'XYZ Ltd.',
      },
    },
    message: PRODUCT_DETAIL,
    statusCode: statusOk,
  };

  const listDto: ListDto = {
    page: 1,
    limit: 10,
    search: 'Test',
    sortBy: 'name',
    sortOrder: 'asc',
  };
  const productListResult = {
    data: [
      {
        id: 1,
        name: 'Test Product',
        description: 'Test Description',
        price: 10.99,
        createdAt: '2022-01-01T00:00:00.000Z',
        updatedAt: '2022-01-01T00:00:00.000Z',
        tenant: {
          id: 1,
          name: 'Test Tenant',
        },
      },
    ],
    message: PRODUCT_LIST,
    statusCode: statusOk,
  };

  const productDeleteResult: ProductDeleteResponseDto = {
    statusCode: statusOk,
    message: PRODUCT_DELETE,
  };

  const id = 1;

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createProduct', () => {
    it('should create a product and return the response', async () => {
      const req = { user: { tenant: 1 } };

      const result: CreateProductResponseDto = {
        data: {
          id: 1,
          name: 'Test Product',
          description: 'Test Description',
          price: 10.99,
          tenant: 1,
          createdAt: '2022-01-01T00:00:00.000Z',
          updatedAt: '2022-01-01T00:00:00.000Z',
        },
        message: PRODUCT_CREATE,
        statusCode: statusCreated,
      };

      mockProductService.createProduct.mockResolvedValue(result);

      expect(await controller.createProduct(productDto, req)).toBe(result);
      expect(mockProductService.createProduct).toHaveBeenCalledWith(
        productDto,
        req.user.tenant,
      );
      expect(service.createProduct).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const req = { user: { tenant: 1 } };
      const error = new Error('Error creating product');

      mockProductService.createProduct.mockRejectedValue(error);

      await expect(controller.createProduct(productDto, req)).rejects.toThrow(
        error,
      );
    });

    it('should handle role-based access control', async () => {
      mockRoleGuard.canActivate = jest.fn(() => true);
      const req = { user: { tenant: 1 } };

      mockProductService.createProduct.mockResolvedValue({
        data: {
          id: 1,
          name: 'Test Product',
          description: 'Test Description',
          price: 10.99,
          tenant: 1,
          createdAt: '2022-01-01T00:00:00.000Z',
          updatedAt: '2022-01-01T00:00:00.000Z',
        },
        message: PRODUCT_CREATE,
        statusCode: statusCreated,
      });

      await expect(
        controller.createProduct(productDto, req),
      ).resolves.not.toThrow();
      expect(mockProductService.createProduct).toHaveBeenCalledWith(
        productDto,
        req.user.tenant,
      );
    });
  });

  describe('updateProduct', () => {
    it('should update a product and return the response', async () => {
      const result: UpdateProductResponseDto = {
        data: {
          id: 1,
          name: 'Test Product',
          description: 'Test Description',
          price: 10.99,
          tenant: 1,
          createdAt: '2022-01-01T00:00:00.000Z',
          updatedAt: '2022-01-01T00:00:00.000Z',
        },
        message: PRODUCT_UPDATE,
        statusCode: statusOk,
      };
      mockProductService.updateProduct.mockResolvedValue(result);

      expect(await controller.updateProduct(id, productDto)).toBe(result);
      expect(mockProductService.updateProduct).toHaveBeenCalledWith(
        id,
        productDto,
      );
      expect(service.updateProduct).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const error = new Error('Error updating product');

      mockProductService.updateProduct.mockRejectedValue(error);

      await expect(controller.updateProduct(id, productDto)).rejects.toThrow(
        error,
      );
    });

    it('should handle role-based access control', async () => {
      mockRoleGuard.canActivate = jest.fn(() => true);
      mockProductService.updateProduct.mockResolvedValue({
        data: {
          id: 1,
          name: 'Test Product',
          description: 'Test Description',
          price: 10.99,
          tenant: 1,
          createdAt: '2022-01-01T00:00:00.000Z',
          updatedAt: '2022-01-01T00:00:00.000Z',
        },
        message: PRODUCT_UPDATE,
        statusCode: statusOk,
      });

      await expect(
        controller.updateProduct(id, productDto),
      ).resolves.not.toThrow();
      expect(mockProductService.updateProduct).toHaveBeenCalledWith(
        id,
        productDto,
      );
    });
  });

  describe('findProductById', () => {
    it('should return product details for a valid id', async () => {
      mockProductService.getProductDetail.mockResolvedValue(
        productDetailResult,
      );

      expect(await controller.findProductById(id)).toBe(productDetailResult);
      expect(mockProductService.getProductDetail).toHaveBeenCalledWith(id);
      expect(service.getProductDetail).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const id = 1;
      const error = new Error('Error fetching product details');

      mockProductService.getProductDetail.mockRejectedValue(error);

      expect(controller.findProductById(id)).rejects.toThrow(error);
      expect(service.getProductDetail).toHaveBeenCalledWith(id);
    });

    it('should handle role-based access control', async () => {
      mockRoleGuard.canActivate = jest.fn(() => true);

      mockProductService.getProductDetail.mockResolvedValue(
        productDetailResult,
      );

      expect(controller.findProductById(id)).resolves.not.toThrow();
      expect(mockProductService.getProductDetail).toHaveBeenCalledWith(id);
    });
  });

  describe('getProductList', () => {
    it('should return a list of products', async () => {
      const req = { user: { tenant: 1 } } as any;

      mockProductService.getProductList.mockResolvedValue(productListResult);

      expect(await controller.getProductList(listDto, req)).toBe(
        productListResult,
      );
      expect(mockProductService.getProductList).toHaveBeenCalledWith(
        listDto,
        req.user.tenant,
      );
    });

    it('should handle errors', async () => {
      const req = { user: { tenant: 1 } } as any;
      const error = new Error(PRODUCT_NOT_FOUND);

      mockProductService.getProductList.mockRejectedValue(error);

      await expect(controller.getProductList(listDto, req)).rejects.toThrow(
        error,
      );
    });

    it('should handle role-based access control', async () => {
      mockRoleGuard.canActivate = jest.fn(() => true);

      const req = { user: { tenant: 1 } } as any;
      mockProductService.getProductList.mockResolvedValue(productListResult);

      await expect(
        controller.getProductList(listDto, req),
      ).resolves.not.toThrow();
      expect(mockProductService.getProductList).toHaveBeenCalledWith(
        listDto,
        req.user.tenant,
      );
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product and return a confirmation response', async () => {
      mockProductService.deleteProduct.mockResolvedValue(productDeleteResult);

      expect(await controller.deleteProduct(id)).toBe(productDeleteResult);
      expect(mockProductService.deleteProduct).toHaveBeenCalledWith(id);
    });

    it('should handle errors', async () => {
      const id = 1;
      const error = new Error('Error deleting product');

      mockProductService.deleteProduct.mockRejectedValue(error);

      await expect(controller.deleteProduct(id)).rejects.toThrow(error);
    });

    it('should handle role-based access control', async () => {
      mockRoleGuard.canActivate = jest.fn(() => true);
      mockProductService.deleteProduct.mockResolvedValue(productDeleteResult);

      await expect(controller.deleteProduct(id)).resolves.not.toThrow();
      expect(mockProductService.deleteProduct).toHaveBeenCalledWith(id);
    });
  });
});
