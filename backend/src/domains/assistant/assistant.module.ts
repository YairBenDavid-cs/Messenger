import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from '../../common/database/database.module';
import { AppendAssistantChatMessageHandler } from './application/commands/append-assistant-chat-message.command';
import { StreamAssistantReplyHandler } from './application/commands/stream-assistant-reply.command';
import { CountAssistantChatMessagesHandler } from './application/queries/count-assistant-chat-messages.query';
import { FindAssistantChatMessageByIdHandler } from './application/queries/find-assistant-chat-message-by-id.query';
import { FindFirstAssistantChatMessageHandler } from './application/queries/find-first-assistant-chat-message.query';
import { GenerateAssistantTitleHandler } from './application/queries/generate-assistant-title.query';
import { ListAssistantChatMessagesHandler } from './application/queries/list-assistant-chat-messages.query';
import { SummarizeConversationContextHandler } from './application/queries/summarize-conversation-context.query';
import { ASSISTANT_CHAT_MESSAGE_REPOSITORY } from './domain/assistant-chat-message.repository';
import { LLM_PROVIDER } from './domain/llm-provider';
import { MESSAGE_SEARCH_PORT } from './domain/message-search.port';
import { OpenAiLlmProvider } from './infrastructure/openai-llm.provider';
import { QueryBusMessageSearchAdapter } from './infrastructure/query-bus-message-search.adapter';
import { AssistantChatMessageMongoRepository } from './model/assistant-chat-message.mongo.repository';
import { AssistantChatMessageModel, AssistantChatMessageSchema } from './model/assistant-chat-message.schema';
import { PromptRepository } from './prompts/prompt.repository';
import { ASSISTANT_TOOLS, type AssistantTool } from './tools/assistant-tool';
import { AssistantToolRegistry } from './tools/assistant-tool.registry';
import { SearchMyMessagesTool } from './tools/search-my-messages.tool';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([{ name: AssistantChatMessageModel.name, schema: AssistantChatMessageSchema }]),
  ],
  providers: [
    AppendAssistantChatMessageHandler,
    StreamAssistantReplyHandler,
    ListAssistantChatMessagesHandler,
    CountAssistantChatMessagesHandler,
    FindAssistantChatMessageByIdHandler,
    FindFirstAssistantChatMessageHandler,
    SummarizeConversationContextHandler,
    GenerateAssistantTitleHandler,
    PromptRepository,
    SearchMyMessagesTool,
    AssistantToolRegistry,
    {
      provide: ASSISTANT_TOOLS,
      useFactory: (search: SearchMyMessagesTool): AssistantTool[] => [search],
      inject: [SearchMyMessagesTool],
    },
    { provide: ASSISTANT_CHAT_MESSAGE_REPOSITORY, useClass: AssistantChatMessageMongoRepository },
    { provide: LLM_PROVIDER, useClass: OpenAiLlmProvider },
    { provide: MESSAGE_SEARCH_PORT, useClass: QueryBusMessageSearchAdapter },
  ],
  exports: [],
})
export class AssistantModule {}
