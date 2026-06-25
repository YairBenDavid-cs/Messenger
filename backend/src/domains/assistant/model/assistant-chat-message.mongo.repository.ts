import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { TransactionContext } from '../../../common/database/transaction-context';
import type { AssistantChatMessage } from '../domain/assistant-chat-message.entity';
import type { AssistantChatMessageRepository, CreateAssistantChatMessageData } from '../domain/assistant-chat-message.repository';
import { AssistantChatMessageMapper } from './assistant-chat-message.mapper';
import { AssistantChatMessageDocument, AssistantChatMessageModel } from './assistant-chat-message.schema';

@Injectable()
export class AssistantChatMessageMongoRepository implements AssistantChatMessageRepository {
  constructor(
    @InjectModel(AssistantChatMessageModel.name)
    private readonly model: Model<AssistantChatMessageDocument>,
  ) {}

  async findByConversationId(conversationId: string): Promise<AssistantChatMessage[]> {
    if (!isValidObjectId(conversationId)) {
      return [];
    }
    const docs = await this.model
      .find({ conversationId })
      .sort({ createdAt: 1, _id: 1 })
      .exec();
    return docs.map((doc) => AssistantChatMessageMapper.toDomain(doc));
  }

  async findFirstByConversationId(conversationId: string): Promise<AssistantChatMessage | null> {
    if (!isValidObjectId(conversationId)) {
      return null;
    }
    const doc = await this.model
      .findOne({ conversationId })
      .sort({ createdAt: 1, _id: 1 })
      .exec();
    return doc ? AssistantChatMessageMapper.toDomain(doc) : null;
  }

  async countByConversationId(conversationId: string): Promise<number> {
    if (!isValidObjectId(conversationId)) {
      return 0;
    }
    return this.model.countDocuments({ conversationId }).exec();
  }

  async findById(id: string): Promise<AssistantChatMessage | null> {
    if (!isValidObjectId(id)) {
      return null;
    }
    const doc = await this.model.findById(id).exec();
    return doc ? AssistantChatMessageMapper.toDomain(doc) : null;
  }

  async create(data: CreateAssistantChatMessageData): Promise<AssistantChatMessage> {
    const [doc] = await this.model.create([data], {
      session: TransactionContext.currentSession(),
    });
    return AssistantChatMessageMapper.toDomain(doc);
  }
}
