import { Company } from 'src/rest/company/entities/company.entity';
import { User } from 'src/rest/user/entities/user.entity';
import { BaseEntityAudit } from 'src/utils/base_entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { UserRole } from './user_role.entity';
import { RolePermission } from './role_permissions.entity';

@Entity({
  schema: 'jaol_account',
  name: 'roles',
})
export class Role extends BaseEntityAudit {

  @Column({ length: 100 })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @Column({
    default: true,
  })
  isActive: boolean;

  @ManyToOne(() => Company, company => company.roles)
  @JoinColumn({
    name: 'company_id',
  })
  company: Company;

  @OneToMany(() => UserRole, userRole => userRole.role)
  userRoles: UserRole[];

  @OneToMany(() => RolePermission, permission => permission.role)
  permissions: RolePermission[];
}
