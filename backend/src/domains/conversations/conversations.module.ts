import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from '../../common/database/database.module';
import { ConversationsService } from './application/conversations.service';
import { CONVERSATION_REPOSITORY } from './domain/conversation.repository';
import { ConversationMongoRepository } from './model/conversation.mongo.repository';
import { ConversationModel, ConversationSchema } from './model/conversation.schema';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([{ name: ConversationModel.name, schema: ConversationSchema }]),
  ],
  providers: [
    ConversationsService,
    { provide: CONVERSATION_REPOSITORY, useClass: ConversationMongoRepository },
  ],
  exports: [ConversationsService],
})
export class ConversationsModule {}
