import { Module } from '@nestjs/common';
import { AuthModule } from '../../../domains/auth/auth.module';
import { RegisterService } from './register.service';

@Module({
  imports: [AuthModule],
  providers: [RegisterService],
  exports: [RegisterService],
})
export class RegisterModule {}
