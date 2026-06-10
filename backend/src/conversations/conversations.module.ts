import { Module } from '@nestjs/common';
import { SEED_CONVERSATIONS } from '../seed/seedData';
import { UsersModule } from '../users/users.module';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { InMemoryConversationRepository } from './repositories/in-memory-conversation.repository';
import { CONVERSATION_REPOSITORY } from './repositories/conversation.repository.interface';

@Module({
  imports: [UsersModule],
  controllers: [ConversationsController],
  providers: [
    ConversationsService,
    {
      provide: CONVERSATION_REPOSITORY,
      useFactory: () => new InMemoryConversationRepository(SEED_CONVERSATIONS),
    },
  ],
  exports: [ConversationsService],
})
export class ConversationsModule {}
