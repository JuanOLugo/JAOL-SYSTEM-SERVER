import { Entity, JoinColumn, ManyToOne } from "typeorm";
import { Role } from "./role.entity";
import { BaseEntityAudit } from "src/utils/base_entity";
import { User } from "src/rest/user/entities/user.entity";

@Entity({
  schema: 'jaol_account',
  name: 'user_roles',
})
export class UserRole extends BaseEntityAudit {

  @ManyToOne(() => User, user => user.roles, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @ManyToOne(() => Role, role => role.userRoles, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'role_id',
  })
  role: Role;
}