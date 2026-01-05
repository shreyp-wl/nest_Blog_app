import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { userRoles } from '../user.types';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
    nullable: false,
  })
  email: string;

  @Column({
    nullable: false,
    select: false,
    length: 100,
  })
  password: string;

  @Column({
    default: true,
    nullable: false,
  })
  isActive: boolean;

  @Column({
    default: userRoles.READER,
  })
  role: userRoles;

  @Column({
    nullable: true,
  })
  refreshToken: string;
}
