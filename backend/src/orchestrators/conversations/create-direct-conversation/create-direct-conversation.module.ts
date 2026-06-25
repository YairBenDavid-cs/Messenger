import { Module } from '@nestjs/common';
import { CreateDirectConversationService } from './create-direct-conversation.service';

@Module({
  providers: [CreateDirectConversationService],
  exports: [CreateDirectConversationService],
})
export class CreateDirectConversationModule {}
