import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from '../../common/database/database.module';
import { MessagesService } from './application/messages.service';
import { MESSAGE_REPOSITORY } from './domain/message.repository';
import { MessageMongoRepository } from './model/message.mongo.repository';
import { MessageModel, MessageSchema } from './model/message.schema';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([{ name: MessageModel.name, schema: MessageSchema }]),
  ],
  providers: [MessagesService, { provide: MESSAGE_REPOSITORY, useClass: MessageMongoRepository }],
  exports: [MessagesService],
})
export class MessagesModule {}
