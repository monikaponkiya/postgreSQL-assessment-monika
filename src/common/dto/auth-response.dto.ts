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
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjQxMDQyOTY0LCJleHAiOjE2NDEwNDU2NDQsImlzQWRtaW4iOnRydWUsInJvbGUiOiJhZG1pbiIsInVzZXJuYW1lIjoiYWRtaW4ifQ.0rQ7Xb9nqDjzZkF5yQp2bPqM1f5pJ2bT',
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
