import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleApproval } from 'src/entities/role-approval.entity';
import { AuthGuard } from 'src/modules/guards/auth.guard';
import { AuthUtils } from 'src/utils/auth.utils';

@Module({
  imports: [TypeOrmModule.forFeature([User, RoleApproval])],
  controllers: [UserController],
  providers: [UserService, User, AuthUtils, AuthGuard],
  exports: [TypeOrmModule.forFeature([User])],
})
export class UserModule {}
