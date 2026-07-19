import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { DeleteRoleDto, GetRoleByIdDto, GetRolesDto } from './dto/any-role.dto';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) { }

  @Post("create")
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }


  @Post('all')
  getAll(@Body() getRolesDto: GetRolesDto) {
    return this.roleService.getAll(getRolesDto);
  }

  @Post('get-by-id')
  getById(@Body() getRoleByIdDto: GetRoleByIdDto) {
    return this.roleService.getById(getRoleByIdDto);
  }


  @Patch("update")
  update(@Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(updateRoleDto);
  }

  @Delete("remove")
  delete(@Body() deleteRoleDto: DeleteRoleDto) {
    return this.roleService.delete(deleteRoleDto);
  }
}



