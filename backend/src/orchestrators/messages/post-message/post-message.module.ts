import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../common/database/database.module';
import { PostMessageService } from './post-message.service';

@Module({
  imports: [DatabaseModule],
  providers: [PostMessageService],
  exports: [PostMessageService],
})
export class PostMessageModule {}
