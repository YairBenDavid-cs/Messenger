import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { sessionOf } from '../../../common/database/mongo-unit-of-work';
import type { UnitOfWork } from '../../../common/database/unit-of-work';
import type { Conversation } from '../domain/conversation.entity';
import type {
  ConversationRepository,
  CreateConversationData,
} from '../domain/conversation.repository';
import { ConversationMapper } from './conversation.mapper';
import { ConversationDocument, ConversationModel } from './conversation.schema';

@Injectable()
export class ConversationMongoRepository implements ConversationRepository {
  constructor(
    @InjectModel(ConversationModel.name)
    private readonly model: Model<ConversationDocument>,
  ) {}

  async findConversationsByUserId(userId: string): Promise<Conversation[]> {
    if (!isValidObjectId(userId)) {
      return [];
    }
    const docs = await this.model
      .find({ participantIds: userId })
      .sort({ lastMessageAt: -1 })
      .exec();
    return docs.map((doc) => ConversationMapper.toDomain(doc));
  }

  async findByConversationId(id: string, uow?: UnitOfWork): Promise<Conversation | null> {
    if (!isValidObjectId(id)) {
      return null;
    }
    const doc = await this.model
      .findById(id)
      .session(sessionOf(uow) ?? null)
      .exec();
    return doc ? ConversationMapper.toDomain(doc) : null;
  }

  async findConversationByParticipantKey(participantKey: string): Promise<Conversation | null> {
    const doc = await this.model.findOne({ participantKey }).exec();
    return doc ? ConversationMapper.toDomain(doc) : null;
  }

  async create(data: CreateConversationData): Promise<Conversation> {
    const unreadCounts = new Map<string, number>(data.participantIds.map((id) => [id, 0]));
    const doc = await this.model.create({
      participantIds: data.participantIds,
      participantKey: data.participantKey,
      lastMessageAt: new Date(),
      lastMessagePreview: '',
      unreadCounts,
    });
    return ConversationMapper.toDomain(doc);
  }

  async updateLastMessage(id: string, preview: string, at: Date, uow?: UnitOfWork): Promise<void> {
    if (!isValidObjectId(id)) {
      return;
    }
    await this.model
      .updateOne({ _id: id }, { $set: { lastMessagePreview: preview, lastMessageAt: at } })
      .session(sessionOf(uow) ?? null)
      .exec();
  }

  async incrementUnread(id: string, forUserId: string, uow?: UnitOfWork): Promise<void> {
    if (!isValidObjectId(id)) {
      return;
    }
    await this.model
      .updateOne({ _id: id }, { $inc: { [`unreadCounts.${forUserId}`]: 1 } })
      .session(sessionOf(uow) ?? null)
      .exec();
  }

  async resetUnread(id: string, forUserId: string): Promise<void> {
    if (!isValidObjectId(id)) {
      return;
    }
    await this.model.updateOne({ _id: id }, { $set: { [`unreadCounts.${forUserId}`]: 0 } }).exec();
  }
}
