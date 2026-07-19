import { BaseEntityAudit } from 'src/utils/base_entity';
import { Column, Entity, OneToOne } from 'typeorm';
import { User } from './user.entity';

@Entity({
  schema: 'jaol_account',
  name: 'private_users',
})
export class PrivateUser extends BaseEntityAudit {
  @Column({
    name: 'password_hash',
    type: 'text',
  })
  passwordHash: string;

  @Column({
    name: 'refresh_token',
    type: 'text',
    nullable: true,
  })
  refreshToken?: string;

  @OneToOne(() => User, (user) => user.privateUser, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  user: User;
}