import { ApiProperty } from '@nestjs/swagger';
import {
  USER_CHANGE_PASSWORD,
  USER_LOGIN,
} from '../constants/response.constants';
import { statusOk } from '../constants/response.status.constant';
import { BaseResponseDto } from './response.dto';

export class LoginResponseDto extends BaseResponseDto {
  @ApiProperty({
    example: {
      access_token:
        'fdgklgewjprcmxlcxclksdfjl2k13l21k3dfndsfksdf45345kjjdsdflskjflsf',
    },
  })
  data: { access_token: string };

  @ApiProperty({ example: statusOk })
  statusCode: number;

  @ApiProperty({ example: USER_LOGIN })
  message: string;
}

export class ChangePasswordResponseDto extends BaseResponseDto {
  @ApiProperty({
    example: {},
  })
  data: { access_token: string };

  @ApiProperty({ example: statusOk })
  statusCode: number;
  @ApiProperty({ example: USER_CHANGE_PASSWORD })
  message: string;
}
