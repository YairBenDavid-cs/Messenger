import { Module } from '@nestjs/common';
import { AuthModule } from '../../../domains/auth/auth.module';
import { UsersModule } from '../../../domains/users/users.module';
import { AuthenticateService } from './login.service';

@Module({
  imports: [UsersModule, AuthModule],
  providers: [AuthenticateService],
  exports: [AuthenticateService],
})
export class AuthenticateModule {}
