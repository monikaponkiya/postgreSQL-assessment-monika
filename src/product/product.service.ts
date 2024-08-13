import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PRODUCT_ALREADY_EXIST,
  PRODUCT_NOT_FOUND,
} from 'src/common/constants/response.constants';
import { statusBadRequest } from 'src/common/constants/response.status.constant';
import { ListDto } from 'src/common/dto/list.dto';
import { Product } from 'src/common/entities/product';
import { Tenant } from 'src/common/entities/tenant';
import { AuthExceptions } from 'src/common/helpers/exceptions/auth.exception';
import applyQueryOptions from 'src/common/queryHelper';
import { Repository } from 'typeorm';
import {
  CreateProductDto,
  UpdateProductDto,
} from './dto/create-update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
  ) {}

  async findProductByName(name: string) {
    return await this.productRepo.findOne({ where: { name } });
  }

  async findProductById(id: number) {
    return await this.productRepo.findOne({ where: { id } });
  }

  async createProduct(product: CreateProductDto, tenant: number) {
    try {
      const isProductExist = await this.findProductByName(product.name);
      if (isProductExist) {
        throw AuthExceptions.customException(
          PRODUCT_ALREADY_EXIST,
          statusBadRequest,
        );
      }
      const productObj = {
        ...product,
        tenant,
      };
      return await this.productRepo.save(productObj);
    } catch (error) {
      throw AuthExceptions.customException(
        error?.response?.message,
        error?.status,
      );
    }
  }

  async updateProduct(id: number, product: UpdateProductDto) {
    try {
      const productExist = await this.findProductById(id);
      if (!productExist) {
        throw AuthExceptions.customException(
          PRODUCT_NOT_FOUND,
          statusBadRequest,
        );
      }
      // productExist.name = product.name;
      // productExist.price = product.price;
      // productExist.description = product.description;
      return await this.productRepo.save({
        ...productExist,
        ...product,
      });
    } catch (error) {
      throw AuthExceptions.customException(
        error?.response?.message,
        error?.status,
      );
    }
  }

  async getProductDetail(id: number) {
    try {
      const productExist = await this.findProductById(id);
      if (!productExist) {
        throw AuthExceptions.customException(
          PRODUCT_NOT_FOUND,
          statusBadRequest,
        );
      }
      return await this.productRepo
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.tenant', 'tenant')
        .where('product.id = :id', { id })
        .select(['product', 'tenant.id', 'tenant.name'])
        .getOne();
    } catch (error) {
      throw AuthExceptions.customException(
        error?.response?.message,
        error?.status,
      );
    }
  }

  async getProductList(body: ListDto, tenant: number) {
    try {
      const page = body.page ? Number(body.page) : 1;
      const limit = body.limit ? Number(body.limit) : 10;
      const skip = (page - 1) * limit;

      const queryBuilder = this.productRepo
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.tenant', 'tenant')
        .where('product.tenant = :tenant', { tenant })
        .select(['product', 'tenant.id', 'tenant.name']);

      if (body.search) {
        queryBuilder.andWhere(
          'product.name LIKE :search OR tenant.name LIKE :search',
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
        'product',
      );

      const [products, total] = await queryBuilder.getManyAndCount();

      return {
        data: products,
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

  async deleteProduct(id: number) {
    try {
      const productExist = await this.findProductById(id);
      if (!productExist) {
        throw AuthExceptions.customException(
          PRODUCT_NOT_FOUND,
          statusBadRequest,
        );
      }
      await this.productRepo
        .createQueryBuilder('product')
        .delete()
        .from(Product)
        .where('id = :id', { id })
        .execute();

      return {};
    } catch (error) {
      throw AuthExceptions.customException(
        error?.response?.message,
        error?.status,
      );
    }
  }
}
