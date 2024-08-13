import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ListDto } from 'src/common/dto/list.dto';
import { Product } from 'src/common/entities/product';
import { Tenant } from 'src/common/entities/tenant';
import { AuthExceptions } from 'src/common/helpers/exceptions/auth.exception';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-update-product.dto';
import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;
  let productRepo: Repository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            save: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Tenant),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    productRepo = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  const productDto: CreateProductDto = {
    name: 'Existing Product',
    description: 'Product Description',
    price: 100,
  };
  const tenant = 1;
  const productId = 1;
  const expectedProductDetail = {
    id: productId,
    name: 'Product Name',
    description: 'Product Description',
    price: 100,
    tenant: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const listDto: ListDto = {
    page: 1,
    limit: 10,
    search: '',
    sortBy: '',
    sortOrder: 'asc',
  };

  const products = [
    {
      id: 1,
      name: 'Product 1',
      price: 100,
      tenant: { id: tenant, name: 'Tenant 1' },
    },
    {
      id: 2,
      name: 'Product 2',
      price: 150,
      tenant: { id: tenant, name: 'Tenant 1' },
    },
  ];
  const total = 2;

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProduct', () => {
    it('should successfully create a product when it does not exist', async () => {
      const productObj = {
        ...productDto,
        id: 1,
        tenant: tenant,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'findProductByName').mockResolvedValue(null);
      jest.spyOn(productRepo, 'save').mockResolvedValue(productObj);
      const result = await service.createProduct(productDto, tenant);

      expect(result).toEqual(result);
      expect(service.findProductByName).toHaveBeenCalledWith(productDto.name);
      jest.spyOn(service, 'createProduct').mockResolvedValue(productObj);
    });

    it('should throw an exception when the product already exists', async () => {
      jest.spyOn(service, 'findProductByName').mockResolvedValue({
        ...productDto,
        id: 1,
        tenant: tenant,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(service.createProduct(productDto, tenant)).rejects.toThrow(
        AuthExceptions.customException(
          'Product already exist',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should handle errors during product creation', async () => {
      const productDto: CreateProductDto = {
        name: 'New Product',
        description: 'Product Description',
        price: 100,
      };
      jest.spyOn(service, 'findProductByName').mockResolvedValue(null); // Simulate that the product does not exist
      jest
        .spyOn(productRepo, 'save')
        .mockRejectedValue(new Error('Internal Server Error'));

      await expect(service.createProduct(productDto, tenant)).rejects.toThrow(
        AuthExceptions.customException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('updateProduct', () => {
    it('should throw an exception when the product does not exist', async () => {
      const productId = 1;
      const updateDto: CreateProductDto = {
        name: 'Updated Product',
        description: 'Updated Description',
        price: 150,
      };
      await expect(service.updateProduct(productId, updateDto)).rejects.toThrow(
        AuthExceptions.customException(
          'Internal Server Error',
          HttpStatus.BAD_REQUEST,
        ),
      );
      jest.spyOn(service, 'findProductById').mockResolvedValue(null);

      await expect(service.updateProduct(productId, updateDto)).rejects.toThrow(
        AuthExceptions.customException(
          'Product not found',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should handle errors during the update process', async () => {
      const updateDto: CreateProductDto = {
        name: 'Updated Product',
        description: 'Updated Description',
        price: 150,
      };

      jest
        .spyOn(productRepo, 'save')
        .mockRejectedValue(new Error('Internal Server Error'));

      await expect(service.updateProduct(productId, updateDto)).rejects.toThrow(
        AuthExceptions.customException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('getProductDetail', () => {
    it('should return product details when the product exists', async () => {
      jest
        .spyOn(service, 'findProductById')
        .mockResolvedValue(expectedProductDetail);
      jest.spyOn(productRepo, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(expectedProductDetail),
      } as any);

      const result = await service.getProductDetail(productId);

      expect(result).toEqual(expectedProductDetail);
      expect(service.findProductById).toHaveBeenCalledWith(productId);
      expect(productRepo.createQueryBuilder).toHaveBeenCalledWith('product');
    });

    it('should throw an exception when the product does not exist', async () => {
      jest.spyOn(service, 'findProductById').mockResolvedValue(null); // Simulate non-existent product

      await expect(service.getProductDetail(productId)).rejects.toThrow(
        AuthExceptions.customException(
          'Product not found',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should handle errors during the query process', async () => {
      jest.spyOn(service, 'findProductById').mockResolvedValue({
        ...expectedProductDetail,
      });
      jest.spyOn(productRepo, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockRejectedValue(new Error('Internal Server Error')),
      } as any);

      await expect(service.getProductDetail(productId)).rejects.toThrow(
        AuthExceptions.customException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('getProductList', () => {
    it('should return a paginated list of products with search and sorting', async () => {
      jest.spyOn(productRepo, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([products, total]),
      } as any);

      const result = await service.getProductList(listDto, tenant);

      expect(result).toEqual({
        data: products,
        total,
        page: listDto.page,
        limit: listDto.limit,
      });
      expect(productRepo.createQueryBuilder).toHaveBeenCalledWith('product');
    });

    it('should handle pagination correctly', async () => {
      jest.spyOn(productRepo, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([products, total]),
      } as any);

      const result = await service.getProductList(listDto, tenant);

      expect(result.page).toBe(listDto.page);
      expect(result.limit).toBe(listDto.limit);
      expect(productRepo.createQueryBuilder).toHaveBeenCalledWith('product');
    });

    it('should handle errors during the query process', async () => {
      jest.spyOn(productRepo, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getManyAndCount: jest
          .fn()
          .mockRejectedValue(new Error('Internal Server Error')),
      } as any);

      await expect(service.getProductList(listDto, tenant)).rejects.toThrow(
        AuthExceptions.customException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('deleteProduct', () => {
    it('should successfully delete a product when it exists', async () => {
      jest
        .spyOn(service, 'findProductById')
        .mockResolvedValue(expectedProductDetail);
      jest.spyOn(productRepo, 'createQueryBuilder').mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ }),
      } as any);

      await expect(service.deleteProduct(productId)).resolves.toEqual({ });
      expect(service.findProductById).toHaveBeenCalledWith(productId);
      expect(productRepo.createQueryBuilder).toHaveBeenCalledWith('product');
    });

    it('should throw an exception when the product does not exist', async () => {
      jest.spyOn(service, 'findProductById').mockResolvedValue(null);

      await expect(service.deleteProduct(productId)).rejects.toThrow(
        AuthExceptions.customException(
          'Product not found',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should handle errors during the delete process', async () => {
      jest.spyOn(service, 'findProductById').mockResolvedValue({
        ...expectedProductDetail,
      });

      jest.spyOn(productRepo, 'createQueryBuilder').mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest
          .fn()
          .mockRejectedValue(new Error('Internal Server Error')),
      } as any);

      await expect(service.deleteProduct(productId)).rejects.toThrow(
        AuthExceptions.customException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });
});
