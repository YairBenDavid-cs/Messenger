import { Module } from '@nestjs/common';
import { CreateDirectConversationModule } from '../create-direct-conversation/create-direct-conversation.module';
import { CreateConversationService } from './create-conversation.service';

@Module({
  imports: [CreateDirectConversationModule],
  providers: [CreateConversationService],
  exports: [CreateConversationService],
})
export class CreateConversationModule {}
