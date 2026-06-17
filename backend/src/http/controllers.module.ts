import { Module } from '@nestjs/common';
import { AuthModule } from '../domains/auth/auth.module';
import { ConversationsModule } from '../domains/conversations/conversations.module';
import { AuthenticateModule } from '../orchestrators/auth/login/login.module';
import { RegisterModule } from '../orchestrators/auth/register/register.module';
import { CreateConversationModule } from '../orchestrators/conversations/create-conversation/create-conversation.module';
import { ListConversationsModule } from '../orchestrators/conversations/list-conversations/list-conversations.module';
import { ReadMessagesModule } from '../orchestrators/messages/fetch-messages/fetch-messages.module';
import { SendMessageModule } from '../orchestrators/messages/send-message/send-message.module';
import { UsersModule } from '../domains/users/users.module';
import { AuthController } from './auth.controller';
import { ConversationsController } from './conversations.controller';
import { MessagesController } from './messages.controller';
import { UsersController } from './users.controller';
import { ParticipantGuard } from './guards/participant.guard';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    RegisterModule,
    AuthenticateModule,
    ListConversationsModule,
    CreateConversationModule,
    ReadMessagesModule,
    SendMessageModule,
    // ParticipantGuard reads conversation membership to authorize message routes.
    ConversationsModule,
  ],
  controllers: [AuthController, UsersController, ConversationsController, MessagesController],
  providers: [ParticipantGuard],
})
export class ControllersModule {}
