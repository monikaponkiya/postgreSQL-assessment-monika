import { ApiProperty } from '@nestjs/swagger';
import {
  TENANT_CREATE,
  TENANT_DETAIL,
  TENANT_LIST,
  TENANT_UPDATE,
} from 'src/common/constants/response.constants';
import {
  statusCreated,
  statusOk,
} from 'src/common/constants/response.status.constant';
import { BaseResponseDto } from 'src/common/dto/response.dto';

class TenantDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Reliance Group' })
  name: string;

  @ApiProperty({ example: '2024-08-08T07:16:43.301Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-08-08T07:16:43.301Z' })
  updatedAt: string;
}

export class CreateTenantResponseDto extends BaseResponseDto {
  @ApiProperty({
    type: TenantDto,
  })
  data: TenantDto;

  @ApiProperty({ example: statusCreated })
  statusCode: number;

  @ApiProperty({ example: TENANT_CREATE })
  message: string;
}

export class UpdateTenantResponseDto extends BaseResponseDto {
  @ApiProperty({
    type: TenantDto,
  })
  data: TenantDto;

  @ApiProperty({ example: statusOk })
  statusCode: number;

  @ApiProperty({ example: TENANT_UPDATE })
  message: string;
}

export class TenantListResponseDto extends BaseResponseDto {
  @ApiProperty({
    type: [TenantDto],
  })
  data: TenantDto[];

  @ApiProperty({ example: statusOk })
  statusCode: number;

  @ApiProperty({ example: TENANT_LIST })
  message: string;
}

export class TenantDetailResponseDto extends BaseResponseDto {
  @ApiProperty({
    type: TenantDto,
  })
  data: TenantDto;

  @ApiProperty({ example: statusOk })
  statusCode: number;

  @ApiProperty({ example: TENANT_DETAIL })
  message: string;
}

export class TenantDeleteResponseDto extends BaseResponseDto {
  @ApiProperty({ example: statusOk })
  statusCode: number;

  @ApiProperty({ example: TENANT_DETAIL })
  message: string;
}
