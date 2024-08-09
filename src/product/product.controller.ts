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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PRODUCT } from 'src/common/constants/api.description.constant';
import {
  PRODUCT_CREATE,
  PRODUCT_DELETE,
  PRODUCT_DETAIL,
  PRODUCT_LIST,
  PRODUCT_UPDATE,
} from 'src/common/constants/response.constants';
import { UserRole } from 'src/common/constants/user-role';
import { ResponseMessage } from 'src/common/decorators/response.decorator';
import { Roles } from 'src/common/decorators/role.decorator';
import { ListDto } from 'src/common/dto/list.dto';
import { RoleGuard } from 'src/security/guard/role.guard';
import { CreateUpdateProductDto } from './dto/create-update-product.dto';
import {
  CreateProductResponseDto,
  ProductDeleteResponseDto,
  ProductDetailsResponseDto,
  ProductListResponseDto,
  UpdateProductResponseDto,
} from './dto/product-response.dto';
import { ProductService } from './product.service';

@Controller('product')
@ApiTags('Product Management')
@ApiBearerAuth()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('create')
  @ApiOperation({
    summary: PRODUCT.CREATE.summary,
    description: PRODUCT.CREATE.description,
  })
  @ApiResponse({ type: CreateProductResponseDto })
  @ResponseMessage(PRODUCT_CREATE)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(RoleGuard)
  async createProduct(
    @Body() product: CreateUpdateProductDto,
    @Req() req: any,
  ) {
    return await this.productService.createProduct(product, req.user.tenantId);
  }

  @Put('update/:id')
  @ApiOperation({
    summary: PRODUCT.UPDATE.summary,
    description: PRODUCT.UPDATE.description,
  })
  @ApiResponse({ type: UpdateProductResponseDto })
  @ResponseMessage(PRODUCT_UPDATE)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(RoleGuard)
  async updateProduct(
    @Param('id') id: number,
    @Body() product: CreateUpdateProductDto,
  ) {
    return await this.productService.updateProduct(id, product);
  }

  @Get('findById/:id')
  @ApiOperation({
    summary: PRODUCT.FIND_BY_ID.summary,
    description: PRODUCT.FIND_BY_ID.description,
  })
  @ApiResponse({ type: ProductDetailsResponseDto })
  @ResponseMessage(PRODUCT_DETAIL)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @UseGuards(RoleGuard)
  async findProductById(@Param('id') id: number) {
    return await this.productService.getProductDetail(id);
  }

  @Post('list')
  @ApiOperation({
    summary: PRODUCT.LIST.summary,
    description: PRODUCT.LIST.description,
  })
  @ApiResponse({ type: ProductListResponseDto })
  @ResponseMessage(PRODUCT_LIST)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @UseGuards(RoleGuard)
  async getProductList(@Body() body: ListDto, @Req() req: any) {
    return await this.productService.getProductList(body, req.user.tenantId);
  }

  @Delete('delete/:id')
  @ApiOperation({
    summary: PRODUCT.DELETE.summary,
    description: PRODUCT.DELETE.description,
  })
  @ApiResponse({ type: ProductDeleteResponseDto })
  @ResponseMessage(PRODUCT_DELETE)
  @Roles(UserRole.ADMIN)
  @UseGuards(RoleGuard)
  async deleteProduct(@Param('id') id: number) {
    return await this.productService.deleteProduct(id);
  }
}
