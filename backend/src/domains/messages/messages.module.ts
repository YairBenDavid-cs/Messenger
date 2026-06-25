import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from '../../common/database/database.module';
import { CreateMessageHandler } from './application/commands/create-message.command';
import { GetMessagesPageHandler } from './application/queries/get-messages-page.query';
import { SearchMyMessagesHandler } from './application/queries/search-my-messages.query';
import { MESSAGE_REPOSITORY } from './domain/message.repository';
import { MessageMongoRepository } from './model/message.mongo.repository';
import { MessageModel, MessageSchema } from './model/message.schema';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([{ name: MessageModel.name, schema: MessageSchema }]),
  ],
  providers: [
    GetMessagesPageHandler,
    CreateMessageHandler,
    SearchMyMessagesHandler,
    { provide: MESSAGE_REPOSITORY, useClass: MessageMongoRepository },
  ],
})
export class MessagesModule {}
