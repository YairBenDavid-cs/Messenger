import { Module } from '@nestjs/common';
import { AuthModule } from '../../../domains/auth/auth.module';
import { AuthenticateService } from './login.service';

@Module({
  imports: [AuthModule],
  providers: [AuthenticateService],
  exports: [AuthenticateService],
})
export class AuthenticateModule {}
