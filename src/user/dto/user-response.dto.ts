import { ApiProperty } from '@nestjs/swagger';
import {
  USER_CREATE,
  USER_DELETE,
  USER_DETAIL,
  USER_LIST,
  USER_UPDATE,
} from 'src/common/constants/response.constants';
import {
  statusCreated,
  statusOk,
} from 'src/common/constants/response.status.constant';
import { UserRole } from 'src/common/constants/user-role';
import { BaseResponseDto } from 'src/common/dto/response.dto';

class UserDto {
  @ApiProperty({ example: '1' })
  id: number;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'jDw9S@example.com' })
  email: string;

  @ApiProperty({ example: '1234567890' })
  phone: string;

  @ApiProperty({ example: '123 Main St' })
  address: string;

  @ApiProperty({ example: 'admin' })
  role: UserRole;
}

export class CreateUserResponseDto extends BaseResponseDto {
  @ApiProperty({ type: UserDto })
  data: UserDto;

  @ApiProperty({ example: statusCreated })
  statusCode: number;

  @ApiProperty({ example: USER_CREATE })
  message: string;
}

export class UpdateUserResponseDto extends BaseResponseDto {
  @ApiProperty({ type: UserDto })
  data: UserDto;

  @ApiProperty({ example: statusOk })
  statusCode: number;

  @ApiProperty({ example: USER_UPDATE })
  message: string;
}

export class UserDetailResponseDto extends BaseResponseDto {
  @ApiProperty({
    example: {
      id: 1,
      name: 'John Doe',
      email: 'jDw9S@example.com',
      phone: '1234567890',
      address: '123 Main St',
      role: 'admin',
      tenant: {
        id: 1,
        name: 'XYZ Ltd.',
      },
    },
  })
  data: UserDto & { tenant: { id: number; name: string } };

  @ApiProperty({ example: statusOk })
  statusCode: number;

  @ApiProperty({ example: USER_DETAIL })
  message: string;
}

export class UserListResponseDto extends BaseResponseDto {
  @ApiProperty({
    example: [
      {
        id: 1,
        name: 'John Doe',
        email: 'jDw9S@example.com',
        phone: '1234567890',
        address: '123 Main St',
        role: 'admin',
        tenant: {
          id: 1,
          name: 'XYZ Ltd.',
        },
      },
    ],
  })
  data: (UserDto & { tenant: { id: number; name: string } })[];

  @ApiProperty({ example: 0 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 10 })
  total: number;

  @ApiProperty({ example: statusOk })
  statusCode: number;

  @ApiProperty({ example: USER_LIST })
  message: string;
}

export class DeleteUserResponseDto extends BaseResponseDto {
  @ApiProperty({ example: statusOk })
  statusCode: number;

  @ApiProperty({ example: USER_DELETE })
  message: string;
}
