import { Module } from '@nestjs/common';
import { ConversationsModule } from '../../../domains/conversations/conversations.module';
import { UsersModule } from '../../../domains/users/users.module';
import { CreateConversationService } from './create-conversation.service';

@Module({
  imports: [ConversationsModule, UsersModule],
  providers: [CreateConversationService],
  exports: [CreateConversationService],
})
export class CreateConversationModule {}
