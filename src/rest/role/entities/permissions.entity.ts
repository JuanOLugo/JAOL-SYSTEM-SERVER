import { WebModule } from "src/rest/webmodules/entities/webmodule.entity";
import { BaseEntityAudit } from "src/utils/base_entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity({
  schema: 'jaol_account',
  name: 'permissions',
})
export class Permission extends BaseEntityAudit {
  @Column({
    unique: true,
    length: 100,
  })
  code: string;

  @Column({
    type: 'text',
  })
  description: string;

  @ManyToOne(() => WebModule, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'module_id',
  })
  module: WebModule;
}