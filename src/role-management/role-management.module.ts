import { Module } from '@nestjs/common';
import { RoleManagementService } from './role-management.service';
import { RoleManagementController } from './role-management.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleApproval } from 'src/entities/role-approval.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoleApproval, User])],
  controllers: [RoleManagementController],
  providers: [RoleManagementService, RoleApproval, User],
  exports: [TypeOrmModule.forFeature([RoleApproval])],
})
export class RoleManagementModule {}
