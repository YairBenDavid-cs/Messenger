import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { DatabaseModule } from '../common/database/database.module';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { AuthModule } from '../domains/auth/auth.module';
import { ConversationsModule } from '../domains/conversations/conversations.module';
import { MessagesModule } from '../domains/messages/messages.module';
import { UsersModule } from '../domains/users/users.module';
import { ControllersModule } from '../http/controllers.module';
import { AuthenticateModule } from '../orchestrators/auth/login/login.module';
import { RegisterModule } from '../orchestrators/auth/register/register.module';
import { CreateConversationModule } from '../orchestrators/conversations/create-conversation/create-conversation.module';
import { ListConversationsModule } from '../orchestrators/conversations/list-conversations/list-conversations.module';
import { ReadMessagesModule } from '../orchestrators/messages/fetch-messages/fetch-messages.module';
import { SendMessageModule } from '../orchestrators/messages/send-message/send-message.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    RegisterModule,
    AuthenticateModule,
    ConversationsModule,
    ListConversationsModule,
    CreateConversationModule,
    MessagesModule,
    ReadMessagesModule,
    SendMessageModule,
    ControllersModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }],
})
export class AppModule {}
