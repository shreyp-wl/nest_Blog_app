import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { AuthUtils } from 'src/utils/auth.utils';

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [AuthService, AuthUtils],
})
export class AuthModule {}
