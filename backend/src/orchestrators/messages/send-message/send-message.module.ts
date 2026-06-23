import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../common/database/database.module';
import { ConversationsModule } from '../../../domains/conversations/conversations.module';
import { MessagesModule } from '../../../domains/messages/messages.module';
import { SendMessageService } from './send-message.service';

@Module({
  imports: [DatabaseModule, MessagesModule, ConversationsModule],
  providers: [SendMessageService],
  exports: [SendMessageService],
})
export class SendMessageModule {}
