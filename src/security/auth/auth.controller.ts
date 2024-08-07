import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from './auth.decorator';
import { LoginDto } from 'src/common/dto/login.dto';

@Controller('auth')
@ApiTags('Auth Management')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('super-admin/login')
  async adminLogin(@Body() loginDto: LoginDto) {
    return this.authService.adminLogin(loginDto);
  }
}
