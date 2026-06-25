import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { DatabaseModule } from '../common/database/database.module';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { AssistantModule } from '../domains/assistant/assistant.module';
import { AuthModule } from '../domains/auth/auth.module';
import { ConversationsModule } from '../domains/conversations/conversations.module';
import { MessagesModule } from '../domains/messages/messages.module';
import { UsersModule } from '../domains/users/users.module';
import { ControllersModule } from '../http/controllers.module';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    CqrsModule.forRoot(),
    UsersModule,
    AuthModule,
    ConversationsModule,
    AssistantModule,
    MessagesModule,
    ControllersModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }],
})
export class AppModule {}
