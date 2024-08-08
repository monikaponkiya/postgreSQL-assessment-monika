import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/common/entities/product';
import { Tenant } from 'src/common/entities/tenant';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Tenant])],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
