import { Module } from '@nestjs/common';
import { ConversationsModule } from '../../../domains/conversations/conversations.module';
import { MessagesModule } from '../../../domains/messages/messages.module';
import { FetchMessagesService } from './fetch-messages.service';

@Module({
  imports: [MessagesModule, ConversationsModule],
  providers: [FetchMessagesService],
  exports: [FetchMessagesService],
})
export class FetchMessagesModule {}
