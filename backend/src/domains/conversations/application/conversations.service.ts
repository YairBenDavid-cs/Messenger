import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type { UnitOfWork } from '../../../common/database/unit-of-work';
import { isDuplicateKeyError } from '../../../common/database/mongo-errors';
import type { Conversation } from '../domain/conversation.entity';
import {
  CONVERSATION_REPOSITORY,
  buildParticipantKey,
  type ConversationRepository,
} from '../domain/conversation.repository';

@Injectable()
export class ConversationsService {
  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversations: ConversationRepository,
  ) {}

  async findConversationsFor(viewerId: string): Promise<Conversation[]> {
    return this.conversations.findConversationsByUserId(viewerId);
  }

  async getById(id: string, uow?: UnitOfWork): Promise<Conversation | null> {
    return this.conversations.findByConversationId(id, uow);
  }

  async createConversation(viewerId: string, otherId: string): Promise<Conversation> {
    const participantKey = buildParticipantKey(viewerId, otherId);

    const existing = await this.conversations.findConversationByParticipantKey(participantKey);
    if (existing !== null) {
      throw new ConflictException('Conversation already exists');
    }

    try {
      return await this.conversations.create({
        participantIds: [viewerId, otherId],
        participantKey,
      });
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException('Conversation already exists');
      }
      throw error;
    }
  }

  async markRead(id: string, userId: string): Promise<void> {
    await this.conversations.resetUnread(id, userId);
  }

  async updateLastMessage(id: string, preview: string, at: Date, uow?: UnitOfWork): Promise<void> {
    await this.conversations.updateLastMessage(id, preview, at, uow);
  }

  async incrementUnreadFor(id: string, userIds: string[], uow?: UnitOfWork): Promise<void> {
    for (const userId of userIds) {
      await this.conversations.incrementUnread(id, userId, uow);
    }
  }
}
