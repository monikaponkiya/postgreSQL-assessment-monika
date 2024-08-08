import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from 'src/common/constants/user-role';
import { RoleGuard } from 'src/security/guard/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from 'src/common/dto/login.dto';
import {
  USER_CREATE,
  USER_DELETE,
  USER_DETAIL,
  USER_LIST,
  USER_LOGIN,
  USER_UPDATE,
} from 'src/common/constants/response.constants';
import { ResponseMessage } from 'src/common/decorators/response.decorator';
import { Public } from 'src/security/auth/auth.decorator';

@Controller('user')
@ApiTags('User Management')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login User' })
  @ResponseMessage(USER_LOGIN)
  @Public()
  async userLogin(@Body() loginDto: LoginDto) {
    return await this.userService.userLogin(loginDto);
  }

  @Post('create')
  @ApiOperation({ summary: 'Create User' })
  @ResponseMessage(USER_CREATE)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UseGuards(RoleGuard)
  async createUser(@Body() createUserDto: CreateUserDto, @Req() req: any) {
    return await this.userService.createUser(createUserDto, req.user.tenantId);
  }

  @Put('update/:id')
  @ApiOperation({ summary: 'Update User' })
  @ResponseMessage(USER_UPDATE)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UseGuards(RoleGuard)
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @Param('id') id: number,
  ) {
    return await this.userService.updateUser(id, updateUserDto);
  }

  @Get('find/:id')
  @ApiOperation({ summary: 'Find User By Id' })
  @ResponseMessage(USER_DETAIL)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(RoleGuard)
  async findUserById(@Param('id') id: number) {
    return await this.userService.findUserDetails(id);
  }

  @Get('list')
  @ApiOperation({ summary: 'List User' })
  @ResponseMessage(USER_LIST)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(RoleGuard)
  async listUser() {
    return await this.userService.findAllUser();
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete User By Id' })
  @ResponseMessage(USER_DELETE)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UseGuards(RoleGuard)
  async deleteUser(@Param('id') id: number) {
    return await this.userService.deleteUser(id);
  }

  @Get('getUserByTenant/:tenantId')
  @ApiOperation({ summary: 'List User By Tenant Id' })
  @ResponseMessage(USER_LIST)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(RoleGuard)
  async findUserByTenant(@Param('tenantId') tenantId: number) {
    return await this.userService.findUserByTenant(tenantId);
  }
}
