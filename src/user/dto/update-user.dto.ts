import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserRole } from 'src/common/constants/user-role';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty()
  phone: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty()
  address: string;

  @IsEnum([UserRole.MANAGER, UserRole.STAFF])
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty()
  role: string;
}
