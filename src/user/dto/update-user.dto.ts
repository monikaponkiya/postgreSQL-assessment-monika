import { ApiProperty } from '@nestjs/swagger';
import { IsEmpty, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { UserRole } from 'src/common/constants/user-role';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  phone: string;

  @IsString()
  @IsEmpty()
  @ApiProperty()
  address: string;

  @IsEnum([UserRole.MANAGER, UserRole.STAFF])
  @IsNotEmpty()
  @ApiProperty()
  role: string;
}
