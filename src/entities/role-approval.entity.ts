import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/modules/database/base-entity';
import { User } from 'src/user/entities/user.entity';
import { userRoles } from 'src/user/user.types';
import { Column, Entity, ManyToOne } from 'typeorm';

export enum RoleApprovalStatus {
  APPROVED = 'approved',
  PENDING = 'pending',
  REJECTED = 'rejected',
}

@Entity('role-approvals')
export class RoleApproval extends BaseEntity {
  @Exclude()
  @ManyToOne(() => User, (user) => user.roleRequest)
  user: User;

  @Column({
    nullable: false,
  })
  requestedRole: userRoles;

  @Column({
    default: RoleApprovalStatus.PENDING,
    nullable: false,
    enum: RoleApprovalStatus,
  })
  status: RoleApprovalStatus;
}
