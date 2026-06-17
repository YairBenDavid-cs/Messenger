import { Module } from '@nestjs/common';
import { ConversationsModule } from '../../../domains/conversations/conversations.module';
import { MessagesModule } from '../../../domains/messages/messages.module';
import { ReadMessagesService } from './fetch-messages.service';

@Module({
  imports: [MessagesModule, ConversationsModule],
  providers: [ReadMessagesService],
  exports: [ReadMessagesService],
})
export class ReadMessagesModule {}
