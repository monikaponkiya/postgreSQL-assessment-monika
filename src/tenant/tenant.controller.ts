import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  TENANT_CREATE,
  TENANT_DELETE,
  TENANT_DETAIL,
  TENANT_LIST,
  TENANT_UPDATE,
} from 'src/common/constants/response.constants';
import { ResponseMessage } from 'src/common/decorators/response.decorator';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantService } from './tenant.service';
import { RoleGuard } from 'src/security/guard/role.guard';
import { UserRole } from 'src/common/constants/user-role';
import { Roles } from 'src/common/decorators/role.decorator';
import { TENANT } from 'src/common/constants/api.description.constant';
import {
  CreateTenantResponseDto,
  TenantDeleteResponseDto,
  TenantDetailResponseDto,
  TenantListResponseDto,
  UpdateTenantResponseDto,
} from './dto/tenant-response.dto';
import { ListDto } from 'src/common/dto/list.dto';

@Controller('tenant')
@ApiTags('Tenant Management')
@ApiBearerAuth()
@Roles(UserRole.SUPER_ADMIN)
@UseGuards(RoleGuard)
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}
  @Post('create')
  @ApiOperation({
    summary: TENANT.CREATE.summary,
    description: TENANT.CREATE.description,
  })
  @ApiResponse({ type: CreateTenantResponseDto })
  @ResponseMessage(TENANT_CREATE)
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantService.createTenant(createTenantDto);
  }

  @Put('update/:id')
  @ApiOperation({
    summary: TENANT.UPDATE.summary,
    description: TENANT.UPDATE.description,
  })
  @ApiResponse({ type: UpdateTenantResponseDto })
  @ResponseMessage(TENANT_UPDATE)
  update(@Param('id') id: number, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantService.updateTenant(id, updateTenantDto);
  }

  @Get('findById/:id')
  @ApiOperation({
    summary: TENANT.FIND_BY_ID.summary,
    description: TENANT.FIND_BY_ID.description,
  })
  @ApiResponse({ type: TenantDetailResponseDto })
  @ResponseMessage(TENANT_DETAIL)
  findById(@Param('id') id: number) {
    return this.tenantService.findTenantById(id);
  }

  @Post('findAll')
  @ApiOperation({
    summary: TENANT.FIND_ALL.summary,
    description: TENANT.FIND_ALL.description,
  })
  @ApiResponse({ type: TenantListResponseDto })
  @ResponseMessage(TENANT_LIST)
  async findAll(@Body() body: ListDto) {
    return await this.tenantService.findAllTenants(body);
  }

  @Delete('delete/:id')
  @ApiOperation({
    summary: TENANT.DELETE.summary,
    description: TENANT.DELETE.description,
  })
  @ApiResponse({ type: TenantDeleteResponseDto })
  @ResponseMessage(TENANT_DELETE)
  delete(@Param('id') id: number) {
    return this.tenantService.deleteTenant(id);
  }
}
