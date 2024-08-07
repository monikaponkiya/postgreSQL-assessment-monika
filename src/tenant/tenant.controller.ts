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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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

@Controller('tenant')
@ApiTags('Tenant Management')
@ApiBearerAuth()
@Roles(UserRole.SUPER_ADMIN)
@UseGuards(RoleGuard)
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}
  @Post('create')
  @ApiOperation({ summary: 'Create Tenant' })
  @ResponseMessage(TENANT_CREATE)
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantService.createTenant(createTenantDto);
  }

  @Put('update/:id')
  @ApiOperation({ summary: 'Update Tenant' })
  @ResponseMessage(TENANT_UPDATE)
  update(@Param('id') id: number, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantService.updateTenant(id, updateTenantDto);
  }

  @Get('findById/:id')
  @ApiOperation({ summary: 'Find Tenant By Id' })
  @ResponseMessage(TENANT_DETAIL)
  findById(@Param('id') id: number) {
    return this.tenantService.findTenantById(id);
  }

  @Get('findAll')
  @ApiOperation({ summary: 'Find All Tenant' })
  @ResponseMessage(TENANT_LIST)
  findAll() {
    return this.tenantService.findAllTenants();
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete Tenant By Id' })
  @ResponseMessage(TENANT_DELETE)
  delete(@Param('id') id: number) {
    return this.tenantService.deleteTenant(id);
  }
}
