import { Module } from '@nestjs/common';
import { ConversationsModule } from '../../../domains/conversations/conversations.module';
import { UsersModule } from '../../../domains/users/users.module';
import { ListConversationsService } from './list-conversations.service';

@Module({
  imports: [ConversationsModule, UsersModule],
  providers: [ListConversationsService],
  exports: [ListConversationsService],
})
export class ListConversationsModule {}
