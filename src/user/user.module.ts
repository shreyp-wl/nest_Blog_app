import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleApproval } from 'src/entities/role-approval.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, RoleApproval])],
  controllers: [UserController],
  providers: [UserService, User],
  exports: [TypeOrmModule.forFeature([User])],
})
export class UserModule {}
