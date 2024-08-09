import { ApiProperty } from '@nestjs/swagger';
import {
  PRODUCT_CREATE,
  PRODUCT_DELETE,
  PRODUCT_DETAIL,
  PRODUCT_LIST,
  PRODUCT_UPDATE,
} from 'src/common/constants/response.constants';
import {
  statusCreated,
  statusOk,
} from 'src/common/constants/response.status.constant';
import { BaseResponseDto } from 'src/common/dto/response.dto';

class ProductDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'XYZ Gadget 1' })
  name: string;

  @ApiProperty({ example: 'Innovative gadget from XYZ Ltd.' })
  description: string;

  @ApiProperty({ example: 120 })
  price: number;

  @ApiProperty({ example: 2 })
  tenantId: number;

  @ApiProperty({ example: '2024-08-08T07:16:43.301Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-08-08T07:16:43.301Z' })
  updatedAt: string;
}

export class CreateProductResponseDto extends BaseResponseDto {
  @ApiProperty({
    type: ProductDto,
  })
  data: ProductDto;

  @ApiProperty({ example: statusCreated })
  statusCode: number;

  @ApiProperty({ example: PRODUCT_CREATE })
  message: string;
}

export class UpdateProductResponseDto extends BaseResponseDto {
  @ApiProperty({
    type: ProductDto,
  })
  data: ProductDto;

  @ApiProperty({ example: statusOk })
  statusCode: number;

  @ApiProperty({ example: PRODUCT_UPDATE })
  message: string;
}

export class ProductDetailsResponseDto extends BaseResponseDto {
  @ApiProperty({
    example: [
      {
        id: 1,
        name: 'XYZ Gadget 1',
        description: 'Innovative gadget from XYZ Ltd.',
        price: 120,
        tenantId: 2,
        createdAt: '2024-08-08T07:16:43.301Z',
        updatedAt: '2024-08-08T07:16:43.301Z',
        tenant: {
          id: 2,
          name: 'XYZ Ltd.',
        },
      },
    ],
  })
  data: (ProductDto & { tenant: { id: number; name: string } })[];

  @ApiProperty({ example: statusOk })
  statusCode: number;

  @ApiProperty({ example: PRODUCT_DETAIL })
  message: string;
}

export class ProductListResponseDto extends BaseResponseDto {
  @ApiProperty({
    example: [
      {
        id: 1,
        name: 'XYZ Gadget 1',
        description: 'Innovative gadget from XYZ Ltd.',
        price: 120,
        tenantId: 2,
        createdAt: '2024-08-08T07:16:43.301Z',
        updatedAt: '2024-08-08T07:16:43.301Z',
        tenant: {
          id: 2,
          name: 'XYZ Ltd.',
        },
      },
    ],
  })
  data: (ProductDto & { tenant: { id: number; name: string } })[];

  @ApiProperty({ example: statusOk })
  statusCode: number;

  @ApiProperty({ example: PRODUCT_LIST })
  message: string;
}

export class ProductDeleteResponseDto extends BaseResponseDto {
  @ApiProperty({ example: statusOk })
  statusCode: number;

  @ApiProperty({ example: PRODUCT_DELETE })
  message: string;
}
