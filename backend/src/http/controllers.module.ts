import { Module } from '@nestjs/common';
import { AuthModule } from '../domains/auth/auth.module';
import { AuthenticateModule } from '../orchestrators/auth/login/login.module';
import { RegisterModule } from '../orchestrators/auth/register/register.module';
import { CreateConversationModule } from '../orchestrators/conversations/create-conversation/create-conversation.module';
import { ListConversationsModule } from '../orchestrators/conversations/list-conversations/list-conversations.module';
import { FetchMessagesModule } from '../orchestrators/messages/fetch-messages/fetch-messages.module';
import { PostMessageModule } from '../orchestrators/messages/post-message/post-message.module';
import { StreamAssistantReplyModule } from '../orchestrators/assistant/stream-reply/stream-reply.module';
import { AssistantRateLimiter } from '../common/rate-limit/assistant-rate-limiter';
import { AuthController } from './auth.controller';
import { AssistantStreamController } from './assistant-stream.controller';
import { ConversationsController } from './conversations.controller';
import { MessagesController } from './messages.controller';
import { UsersController } from './users.controller';
import { AssistantRateLimitGuard } from './guards/assistant-rate-limit.guard';
import { ParticipantGuard } from './guards/participant.guard';

@Module({
  imports: [
    AuthModule,
    RegisterModule,
    AuthenticateModule,
    ListConversationsModule,
    CreateConversationModule,
    FetchMessagesModule,
    PostMessageModule,
    StreamAssistantReplyModule,
  ],
  controllers: [
    AuthController,
    UsersController,
    ConversationsController,
    MessagesController,
    AssistantStreamController,
  ],
  providers: [ParticipantGuard, AssistantRateLimiter, AssistantRateLimitGuard],
})
export class ControllersModule {}
