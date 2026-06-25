import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, isValidObjectId } from 'mongoose';
import { TransactionContext } from '../../../common/database/transaction-context';
import type { Conversation, ConversationType } from '../domain/conversation.entity';
import type {
  ConversationRepository,
  CreateDirectConversationData,
} from '../domain/conversation.repository';
import { ConversationMapper } from './conversation.mapper';
import {
  AssistantConversationDocument,
  AssistantConversationModel,
  ConversationDocument,
  ConversationModel,
  DirectConversationDocument,
  DirectConversationModel,
} from './conversation.schema';

@Injectable()
export class ConversationMongoRepository implements ConversationRepository {
  constructor(
    @InjectModel(ConversationModel.name)
    private readonly model: Model<ConversationDocument>,
    @InjectModel(DirectConversationModel.name)
    private readonly directModel: Model<DirectConversationDocument>,
    @InjectModel(AssistantConversationModel.name)
    private readonly assistantModel: Model<AssistantConversationDocument>,
  ) {}

  async findConversationsByUserId(
    userId: string,
    type?: ConversationType,
  ): Promise<Conversation[]> {
    if (!isValidObjectId(userId)) {
      return [];
    }
    const filter: FilterQuery<ConversationModel> = type
      ? { participantIds: userId, type }
      : { participantIds: userId };
    const docs = await this.model.find(filter).sort({ lastMessageAt: -1 }).exec();
    return docs.map((doc) => ConversationMapper.toDomain(doc));
  }

  async findByConversationId(id: string): Promise<Conversation | null> {
    if (!isValidObjectId(id)) {
      return null;
    }
    const doc = await this.model
      .findById(id)
      .session(TransactionContext.currentSession() ?? null)
      .exec();
    return doc ? ConversationMapper.toDomain(doc) : null;
  }

  async findConversationByParticipantKey(participantKey: string): Promise<Conversation | null> {
    const doc = await this.directModel.findOne({ participantKey }).exec();
    return doc ? ConversationMapper.toDomain(doc) : null;
  }

  async createDirect(data: CreateDirectConversationData): Promise<Conversation> {
    const unreadCounts = new Map<string, number>(data.participantIds.map((id) => [id, 0]));
    const doc = await this.directModel.create({
      participantIds: data.participantIds,
      participantKey: data.participantKey,
      lastMessageAt: new Date(),
      lastMessagePreview: '',
      unreadCounts,
    });
    return ConversationMapper.toDomain(doc);
  }

  async createAssistant(ownerId: string): Promise<Conversation> {
    const doc = await this.assistantModel.create({
      participantIds: [ownerId],
      lastMessageAt: new Date(),
      lastMessagePreview: '',
    });
    return ConversationMapper.toDomain(doc);
  }

  async updateLastMessage(id: string, preview: string, at: Date): Promise<void> {
    if (!isValidObjectId(id)) {
      return;
    }
    await this.model
      .updateOne({ _id: id }, { $set: { lastMessagePreview: preview, lastMessageAt: at } })
      .session(TransactionContext.currentSession() ?? null)
      .exec();
  }

  async updateTitle(id: string, title: string): Promise<void> {
    if (!isValidObjectId(id)) {
      return;
    }
    await this.assistantModel.updateOne({ _id: id }, { $set: { title } }).exec();
  }

  async updateContextSummary(id: string, summary: string, summarizedUpTo: number): Promise<void> {
    if (!isValidObjectId(id)) {
      return;
    }
    await this.assistantModel
      .updateOne({ _id: id }, { $set: { contextSummary: summary, summarizedUpTo } })
      .exec();
  }

  async incrementUnread(id: string, forUserId: string): Promise<void> {
    if (!isValidObjectId(id)) {
      return;
    }
    await this.model
      .updateOne({ _id: id }, { $inc: { [`unreadCounts.${forUserId}`]: 1 } })
      .session(TransactionContext.currentSession() ?? null)
      .exec();
  }

  async resetUnread(id: string, forUserId: string): Promise<void> {
    if (!isValidObjectId(id)) {
      return;
    }
    await this.model.updateOne({ _id: id }, { $set: { [`unreadCounts.${forUserId}`]: 0 } }).exec();
  }
}
