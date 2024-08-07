import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  reset_token: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  new_password: string;
}
