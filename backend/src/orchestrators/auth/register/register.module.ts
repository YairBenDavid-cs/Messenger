import { Module } from '@nestjs/common';
import { AuthModule } from '../../../domains/auth/auth.module';
import { UsersModule } from '../../../domains/users/users.module';
import { RegisterService } from './register.service';

@Module({
  imports: [UsersModule, AuthModule],
  providers: [RegisterService],
  exports: [RegisterService],
})
export class RegisterModule {}
