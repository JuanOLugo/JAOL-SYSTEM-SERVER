import { BaseEntityAudit } from 'src/utils/base_entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity({
  schema: 'jaol_account',
  name: 'web_modules',
})
export class WebModule extends BaseEntityAudit {
  @Column({
    length: 100,
  })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @Column({
    length: 255,
  })
  path: string;

  @ManyToOne(() => WebModule, (parent) => parent.children)
  parent: WebModule;

  @OneToMany(() => WebModule, (child) => child.parent)
  children: WebModule[];
}
