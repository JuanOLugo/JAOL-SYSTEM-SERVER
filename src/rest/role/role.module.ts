import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../user/entities/user.entity";
import { Company } from "../company/entities/company.entity";
import { Role } from "./entities/role.entity";
import { RolePermission } from "./entities/role_permissions.entity";
import { RoleController } from "./role.controller";
import { RoleService } from "./role.service";
import { UserRole } from "./entities/user_role.entity";
import { Permission } from "./entities/permissions.entity";


@Module({
  imports: [TypeOrmModule.forFeature([User, Company, Role, RolePermission, UserRole, Permission])],
  controllers: [RoleController],
  providers: [RoleService],
})
export class RoleModule {}
