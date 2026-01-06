import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './modules/database/database.module';
import { RoleManagementModule } from './role-management/role-management.module';

@Module({
  imports: [AuthModule, UserModule, DatabaseModule, RoleManagementModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
