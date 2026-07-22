import { Company } from 'src/rest/company/entities/company.entity';
import { UserRole } from 'src/rest/role/entities/user_role.entity';
import { BaseEntityAudit } from 'src/utils/base_entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { PrivateUser } from './private-user.entity';

@Entity({
  schema: 'jaol_account',
  name: 'users',
})
export class User extends BaseEntityAudit {
  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({
    length: 150,
    nullable: true,
  })
  email?: string;

  @Column({
    length: 30,
    nullable: true,
  })
  phone?: string;

  @Column({
    default: true,
  })
  isActive: boolean;

  @ManyToOne(() => Company, (company) => company.users)
  @JoinColumn({
    name: 'company_id',
  })
  company: Company;

  @OneToMany(() => UserRole, (role) => role.user)
  roles: UserRole[];

  @OneToOne(() => PrivateUser, (privateUser) => privateUser.user, {
    cascade: ['insert', 'update', 'remove'],
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'private_user_id',
  })
  privateUser: PrivateUser;
}