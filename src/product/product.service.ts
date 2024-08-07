import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/common/entities/product';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { AuthExceptions } from 'src/common/helpers/exceptions/auth.exception';
import { statusBadRequest } from 'src/common/constants/response.status.constant';
import {
  PRODUCT_ALREADY_EXIST,
  PRODUCT_NOT_FOUND,
} from 'src/common/constants/response.constants';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
  ) {}

  async findProductByName(name: string) {
    return await this.productRepo.findOne({ where: { name } });
  }

  async findProductById(id: number) {
    return await this.productRepo.findOne({ where: { id } });
  }

  async createProduct(product: CreateProductDto, tenantId: number) {
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
        tenantId: tenantId,
      };
      return await this.productRepo.save(productObj);
    } catch (error) {
      throw AuthExceptions.customException(
        error?.response?.message,
        error?.status,
      );
    }
  }

  async updateProduct(id: number, product: CreateProductDto) {
    try {
      const productExist = await this.findProductById(id);
      if (!productExist) {
        throw AuthExceptions.customException(
          PRODUCT_NOT_FOUND,
          statusBadRequest,
        );
      }
      productExist.name = product.name;
      productExist.price = product.price;
      productExist.description = product.description;
      return await this.productRepo.save(productExist);
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

  async getProductList() {
    try {
      return await this.productRepo
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.tenant', 'tenant')
        .select(['product', 'tenant.id', 'tenant.name'])
        .getMany();
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
      return await this.productRepo.delete({ id });
    } catch (error) {
      throw AuthExceptions.customException(
        error?.response?.message,
        error?.status,
      );
    }
  }
}
