import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from '../../common/database/database.module';
import { CreateAssistantConversationHandler } from './application/commands/create-assistant-conversation.command';
import { CreateDirectConversationHandler } from './application/commands/create-direct-conversation.command';
import { IncrementConversationUnreadHandler } from './application/commands/increment-conversation-unread.command';
import { MarkConversationReadHandler } from './application/commands/mark-conversation-read.command';
import { UpdateConversationContextSummaryHandler } from './application/commands/update-conversation-context-summary.command';
import { UpdateConversationLastMessageHandler } from './application/commands/update-conversation-last-message.command';
import { UpdateConversationTitleHandler } from './application/commands/update-conversation-title.command';
import { FindConversationByIdHandler } from './application/queries/find-conversation-by-id.query';
import { FindConversationsForUserHandler } from './application/queries/find-conversations-for-user.query';
import { CONVERSATION_REPOSITORY } from './domain/conversation.repository';
import { ConversationMongoRepository } from './model/conversation.mongo.repository';
import {
  AssistantConversationModel,
  AssistantConversationSchema,
  ConversationModel,
  ConversationSchema,
  DirectConversationModel,
  DirectConversationSchema,
} from './model/conversation.schema';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([
      {
        name: ConversationModel.name,
        schema: ConversationSchema,
        discriminators: [
          { name: DirectConversationModel.name, schema: DirectConversationSchema, value: 'direct' },
          {
            name: AssistantConversationModel.name,
            schema: AssistantConversationSchema,
            value: 'assistant',
          },
        ],
      },
    ]),
  ],
  providers: [
    { provide: CONVERSATION_REPOSITORY, useClass: ConversationMongoRepository },
    FindConversationsForUserHandler,
    FindConversationByIdHandler,
    CreateDirectConversationHandler,
    CreateAssistantConversationHandler,
    MarkConversationReadHandler,
    UpdateConversationLastMessageHandler,
    UpdateConversationTitleHandler,
    UpdateConversationContextSummaryHandler,
    IncrementConversationUnreadHandler,
  ],
})
export class ConversationsModule {}
