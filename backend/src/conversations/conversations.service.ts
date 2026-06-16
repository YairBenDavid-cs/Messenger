import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { UsersService } from '../users/users.service';
import type { Conversation, ConversationView } from './entities/conversation.entity';
import {
  CONVERSATION_REPOSITORY,
  type ConversationRepository,
} from './repositories/conversation.repository.interface';

@Injectable()
export class ConversationsService {
  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversations: ConversationRepository,
    private readonly users: UsersService,
  ) {}

  async listConversations(viewerId: string): Promise<ConversationView[]> {
    const conversations = await this.conversations.findAllConversationsByUserId(viewerId);
    return Promise.all(conversations.map((conversation) => this.enrich(conversation, viewerId)));
  }

  async createConversation(viewerId: string, participantIds: string[]): Promise<ConversationView> {
    const otherId = participantIds.find((id) => id !== viewerId) ?? participantIds[0];

    const other = await this.users.findById(otherId);
    if (other === null) {
      throw new NotFoundException('Participant not found');
    }

    const existing = await this.conversations.findConversationByParticipants(viewerId, otherId);
    if (existing !== null) {
      throw new ConflictException('Conversation already exists');
    }

    const now = new Date().toISOString();
    const conversation: Conversation = {
      id: randomUUID(),
      participantIds: [viewerId, otherId],
      lastMessagePreview: '',
      lastMessageAt: now,
      unreadCounts: { [viewerId]: 0, [otherId]: 0 },
    };
    const saved = await this.conversations.saveConversation(conversation);
    return await this.enrich(saved, viewerId);
  }

  async getById(id: string): Promise<Conversation | null> {
    return await this.conversations.findConversationById(id);
  }

  async markRead(id: string, userId: string): Promise<void> {
    await this.conversations.resetConversationUnread(id, userId);
  }

  async recordNewMessage(id: string, senderId: string, preview: string, at: string): Promise<void> {
    await this.conversations.updateConversationLastMessage(id, preview, at);
    const conversation = await this.conversations.findConversationById(id);
    if (conversation === null) {
      return;
    }
    for (const participantId of conversation.participantIds) {
      if (participantId !== senderId) {
        await this.conversations.incrementConversationUnread(id, participantId);
      }
    }
  }

  private async enrich(conversation: Conversation, viewerId: string): Promise<ConversationView> {
    const otherId =
      conversation.participantIds.find((id) => id !== viewerId) ?? conversation.participantIds[0];
    const other = await this.users.findById(otherId);

    return {
      id: conversation.id,
      participants: conversation.participantIds,
      title: other?.name ?? 'Unknown',
      avatarUrl: other?.avatarUrl ?? '',
      lastMessagePreview: conversation.lastMessagePreview,
      lastMessageAt: conversation.lastMessageAt,
      unreadCount: conversation.unreadCounts[viewerId] ?? 0,
    };
  }
}
