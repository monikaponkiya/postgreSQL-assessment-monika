import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  PRODUCT_CREATE,
  PRODUCT_DELETE,
  PRODUCT_DETAIL,
  PRODUCT_LIST,
  PRODUCT_UPDATE,
} from 'src/common/constants/response.constants';
import { ResponseMessage } from 'src/common/decorators/response.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductService } from './product.service';
import { RoleGuard } from 'src/security/guard/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserRole } from 'src/common/constants/user-role';

@Controller('product')
@ApiTags('Product Management')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create Product' })
  @ResponseMessage(PRODUCT_CREATE)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(RoleGuard)
  async createProduct(@Body() product: CreateProductDto, @Req() req: any) {
    return await this.productService.createProduct(product, req.user.tenantId);
  }

  @Put('update/:id')
  @ApiOperation({ summary: 'Update Product' })
  @ResponseMessage(PRODUCT_UPDATE)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(RoleGuard)
  async updateProduct(
    @Param('id') id: number,
    @Body() product: CreateProductDto,
  ) {
    return await this.productService.updateProduct(id, product);
  }

  @Get('findById/:id')
  @ApiOperation({ summary: 'Get Product By Id' })
  @ResponseMessage(PRODUCT_DETAIL)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @UseGuards(RoleGuard)
  async findProductById(@Param('id') id: number) {
    return await this.productService.getProductDetail(id);
  }

  @Get('list')
  @ApiOperation({ summary: 'Get Product List' })
  @ResponseMessage(PRODUCT_LIST)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @UseGuards(RoleGuard)
  async getProductList() {
    return await this.productService.getProductList();
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete Product' })
  @ResponseMessage(PRODUCT_DELETE)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(RoleGuard)
  async deleteProduct(@Param('id') id: number) {
    return await this.productService.deleteProduct(id);
  }

  @Get('listByTenant/:tenantId')
  @ApiOperation({ summary: 'Get Product By Tenant Id' })
  @ResponseMessage(PRODUCT_LIST)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @UseGuards(RoleGuard)
  async getProductByTenant(@Param('tenantId') tenantId: number) {
    return await this.productService.getProductByTenant(tenantId);
  }
}
