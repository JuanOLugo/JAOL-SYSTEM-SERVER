import { BaseEntityAudit } from "src/utils/base_entity";
import { Entity, JoinColumn, ManyToOne } from "typeorm";
import { Role } from "./role.entity";
import { Permission } from "./permissions.entity";

@Entity({
  schema: 'jaol_account',
  name: 'role_permissions',
})
export class RolePermission extends BaseEntityAudit {

  @ManyToOne(() => Role, role => role.permissions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'role_id',
  })
  role: Role;

  @ManyToOne(() => Permission, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'permission_id',
  })
  permission: Permission;
}