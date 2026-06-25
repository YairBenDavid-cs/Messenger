import { Module } from '@nestjs/common';
import { ListConversationsService } from './list-conversations.service';

@Module({
  providers: [ListConversationsService],
  exports: [ListConversationsService],
})
export class ListConversationsModule {}
