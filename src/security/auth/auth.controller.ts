import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { USER } from 'src/common/constants/api.description.constant';
import {
  USER_CHANGE_PASSWORD,
  USER_LOGIN,
} from 'src/common/constants/response.constants';
import { UserRole } from 'src/common/constants/user-role';
import { ResponseMessage } from 'src/common/decorators/response.decorator';
import { Roles } from 'src/common/decorators/role.decorator';
import {
  ChangePasswordResponseDto,
  LoginResponseDto,
} from 'src/common/dto/auth-response.dto';
import { ChangePasswordDto } from 'src/common/dto/change-password.dto';
import { LoginDto } from 'src/common/dto/login.dto';
import { RoleGuard } from '../guard/role.guard';
import { Public } from './auth.decorator';
import { AuthService } from './auth.service';
import { statusOk } from 'src/common/constants/response.status.constant';

@Controller('auth')
@ApiTags('Auth Management')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('user/login')
  @HttpCode(statusOk)
  @ApiOperation({
    summary: USER.LOGIN.summary,
    description: USER.LOGIN.description,
  })
  @ApiResponse({ type: LoginResponseDto })
  @ResponseMessage(USER_LOGIN)
  async adminLogin(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('user/changePassword')
  @ApiOperation({
    summary: USER.CHANGE_PASSWORD.summary,
    description: USER.CHANGE_PASSWORD.description,
  })
  @ApiResponse({ type: ChangePasswordResponseDto })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @UseGuards(RoleGuard)
  @ResponseMessage(USER_CHANGE_PASSWORD)
  async changePassword(@Body() body: ChangePasswordDto) {
    return this.authService.changePassword(body);
  }
}
