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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { USER } from 'src/common/constants/api.description.constant';
import {
  USER_CREATE,
  USER_DELETE,
  USER_DETAIL,
  USER_LIST,
  USER_UPDATE,
} from 'src/common/constants/response.constants';
import { UserRole } from 'src/common/constants/user-role';
import { ResponseMessage } from 'src/common/decorators/response.decorator';
import { Roles } from 'src/common/decorators/role.decorator';
import { ListDto } from 'src/common/dto/list.dto';
import { RoleGuard } from 'src/security/guard/role.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  CreateUserResponseDto,
  DeleteUserResponseDto,
  UpdateUserResponseDto,
  UserDetailResponseDto,
  UserListResponseDto,
} from './dto/user-response.dto';
import { UserService } from './user.service';

@Controller('user')
@ApiTags('User Management')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  @ApiOperation({
    summary: USER.CREATE.summary,
    description: USER.CREATE.description,
  })
  @ApiResponse({ type: CreateUserResponseDto })
  @ResponseMessage(USER_CREATE)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UseGuards(RoleGuard)
  async createUser(@Body() createUserDto: CreateUserDto, @Req() req: any) {
    return await this.userService.createUser(createUserDto, req.user.tenantId);
  }

  @Put('update/:id')
  @ApiOperation({
    summary: USER.UPDATE.summary,
    description: USER.UPDATE.description,
  })
  @ApiResponse({ type: UpdateUserResponseDto })
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
  @ApiOperation({
    summary: USER.FIND_BY_ID.summary,
    description: USER.FIND_BY_ID.description,
  })
  @ApiResponse({ type: UserDetailResponseDto })
  @ResponseMessage(USER_DETAIL)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(RoleGuard)
  async findUserById(@Param('id') id: number) {
    return await this.userService.findUserDetails(id);
  }

  @Post('list')
  @ApiOperation({
    summary: USER.FIND_ALL.summary,
    description: USER.FIND_ALL.description,
  })
  @ApiResponse({ type: UserListResponseDto })
  @ResponseMessage(USER_LIST)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(RoleGuard)
  async listUser(@Body() body: ListDto, @Req() req: any) {
    return await this.userService.findAllUser(body, req.user);
  }

  @Delete('delete/:id')
  @ApiOperation({
    summary: USER.DELETE.summary,
    description: USER.DELETE.description,
  })
  @ApiResponse({ type: DeleteUserResponseDto })
  @ResponseMessage(USER_DELETE)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UseGuards(RoleGuard)
  async deleteUser(@Param('id') id: number) {
    return await this.userService.deleteUser(id);
  }
}
