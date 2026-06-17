import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type { ClientSession } from 'mongoose';
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
    return this.conversations.findByParticipant(viewerId);
  }

  async getById(id: string): Promise<Conversation | null> {
    return this.conversations.findById(id);
  }

  async createConversation(viewerId: string, otherId: string): Promise<Conversation> {
    const participantKey = buildParticipantKey(viewerId, otherId);

    const existing = await this.conversations.findByParticipantKey(participantKey);
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

  async recordNewMessage(
    id: string,
    senderId: string,
    preview: string,
    at: Date,
    session?: ClientSession,
  ): Promise<void> {
    await this.conversations.updateLastMessage(id, preview, at, session);
    const conversation = await this.conversations.findById(id, session);
    if (conversation === null) {
      return;
    }
    for (const participantId of conversation.participantIds) {
      if (participantId !== senderId) {
        await this.conversations.incrementUnread(id, participantId, session);
      }
    }
  }
}
