import { Role } from "src/rest/role/entities/role.entity";
import { User } from "src/rest/user/entities/user.entity";
import { BaseEntityAudit } from "src/utils/base_entity";
import { Column, Entity, OneToMany } from "typeorm";

@Entity({
  schema: 'jaol_account',
  name: 'companies',
})
export class Company extends BaseEntityAudit {
  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 255, nullable: true })
  location?: string;

  @Column({ length: 150 })
  email: string;

  @Column({ length: 30, nullable: true })
  phone?: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => User, user => user.company, {cascade: true, onDelete: 'CASCADE'})
  users: User[];

  @OneToMany(() => Role, role => role.company, {cascade: true, onDelete: 'CASCADE'})
  roles: Role[];
}