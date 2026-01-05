import { User } from './../../user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy?: string;

  @ManyToOne('User', { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  creator?: User;

  @Column({ nullable: true })
  updatedBy?: string;

  @ManyToOne('User', { nullable: true })
  @JoinColumn({ name: 'updatedBy' })
  updater?: User;
}
