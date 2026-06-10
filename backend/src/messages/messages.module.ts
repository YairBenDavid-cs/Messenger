import { Module } from '@nestjs/common';
import { SEED_MESSAGES_BY_CONVERSATION } from '../seed/seedData';
import { ConversationsModule } from '../conversations/conversations.module';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { InMemoryMessageRepository } from './repositories/in-memory-message.repository';
import { MESSAGE_REPOSITORY } from './repositories/message.repository.interface';

@Module({
  imports: [ConversationsModule],
  controllers: [MessagesController],
  providers: [
    MessagesService,
    {
      provide: MESSAGE_REPOSITORY,
      useFactory: () => new InMemoryMessageRepository(SEED_MESSAGES_BY_CONVERSATION),
    },
  ],
})
export class MessagesModule {}
