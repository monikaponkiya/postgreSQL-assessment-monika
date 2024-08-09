import { ApiProperty } from '@nestjs/swagger';
import { statusOk } from '../constants/response.status.constant';

export class BaseResponseDto {
  @ApiProperty({ example: statusOk })
  statusCode: number;

  @ApiProperty()
  message: string;
}
