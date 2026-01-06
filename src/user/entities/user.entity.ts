import { Entity, Column, OneToMany } from 'typeorm';
import { userRoles } from '../user.types';
import { RoleApproval } from 'src/entities/role-approval.entity';
import { BaseEntity } from 'src/modules/database/base-entity';
import { Exclude, Expose } from 'class-transformer';

@Entity()
export class User extends BaseEntity {
  @Expose()
  @Column({
    unique: true,
    nullable: false,
  })
  email: string;

  @Exclude()
  @Column({
    nullable: false,
    select: false,
    length: 100,
  })
  password: string;

  @Expose()
  @Column({
    default: true,
    nullable: false,
  })
  isActive: boolean;

  @Expose()
  @Column({
    default: userRoles.READER,
  })
  role: userRoles;

  @Exclude()
  @Column({
    nullable: true,
  })
  refreshToken: string;

  @OneToMany(() => RoleApproval, (approval) => approval.user)
  roleRequest: RoleApproval[];
}
