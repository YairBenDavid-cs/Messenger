import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, isValidObjectId } from 'mongoose';
import { TransactionContext } from '../../../common/database/transaction-context';
import type { Cursor, Message } from '../domain/message.entity';
import type { CreateMessageData, MessageRepository } from '../domain/message.repository';
import { MessageMapper } from './message.mapper';
import { MessageDocument, MessageModel } from './message.schema';

@Injectable()
export class MessageMongoRepository implements MessageRepository {
  constructor(
    @InjectModel(MessageModel.name)
    private readonly model: Model<MessageDocument>,
  ) {}

  async findPage(
    conversationId: string,
    cursor: Cursor | undefined,
    limit: number,
  ): Promise<Message[]> {
    if (!isValidObjectId(conversationId)) {
      return [];
    }

    const filter: FilterQuery<MessageDocument> = { conversationId };
    if (cursor !== undefined) {
      filter.$or = [
        { createdAt: { $lt: cursor.createdAt } },
        { createdAt: cursor.createdAt, _id: { $lt: cursor.id } },
      ];
    }

    const docs = await this.model.find(filter).sort({ createdAt: -1, _id: -1 }).limit(limit).exec();

    return docs.map((doc) => MessageMapper.toDomain(doc));
  }

  async create(data: CreateMessageData): Promise<Message> {
    const [doc] = await this.model.create([data], {
      session: TransactionContext.currentSession(),
    });
    return MessageMapper.toDomain(doc);
  }

  async searchBySender(senderId: string, query: string, limit: number): Promise<Message[]> {
    if (!isValidObjectId(senderId)) {
      return [];
    }

    const filter: FilterQuery<MessageDocument> = {
      senderId,
      text: { $regex: escapeRegex(query), $options: 'i' },
    };

    const docs = await this.model.find(filter).sort({ createdAt: -1, _id: -1 }).limit(limit).exec();

    return docs.map((doc) => MessageMapper.toDomain(doc));
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
