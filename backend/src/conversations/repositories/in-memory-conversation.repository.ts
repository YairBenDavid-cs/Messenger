import { Injectable } from '@nestjs/common';
import type { Conversation } from '../entities/conversation.entity';
import type { ConversationRepository } from './conversation.repository.interface';

@Injectable()
export class InMemoryConversationRepository implements ConversationRepository {
  private readonly conversations: Map<string, Conversation>;

  constructor(seed: Conversation[]) {
    this.conversations = new Map(seed.map((conversation) => [conversation.id, conversation]));
  }

  async findAllConversationsByUserId(userId: string): Promise<Conversation[]> {
    const result: Conversation[] = [];
    for (const conversation of this.conversations.values()) {
      if (conversation.participantIds.includes(userId)) {
        result.push(conversation);
      }
    }
    return result;
  }

  async findConversationById(id: string): Promise<Conversation | null> {
    return this.conversations.get(id) ?? null;
  }

  async saveConversation(conversation: Conversation): Promise<Conversation> {
    this.conversations.set(conversation.id, conversation);
    return conversation;
  }

  async findConversationByParticipants(
    userIdA: string,
    userIdB: string,
  ): Promise<Conversation | null> {
    for (const conversation of this.conversations.values()) {
      const { participantIds } = conversation;
      if (
        participantIds.length === 2 &&
        participantIds.includes(userIdA) &&
        participantIds.includes(userIdB)
      ) {
        return conversation;
      }
    }
    return null;
  }

  async updateConversationLastMessage(id: string, preview: string, at: string): Promise<void> {
    const conversation = this.conversations.get(id);
    if (conversation === undefined) {
      return;
    }
    conversation.lastMessagePreview = preview;
    conversation.lastMessageAt = at;
  }

  async incrementConversationUnread(id: string, forUserId: string): Promise<void> {
    const conversation = this.conversations.get(id);
    if (conversation === undefined) {
      return;
    }
    conversation.unreadCounts[forUserId] = (conversation.unreadCounts[forUserId] ?? 0) + 1;
  }

  async resetConversationUnread(id: string, forUserId: string): Promise<void> {
    const conversation = this.conversations.get(id);
    if (conversation === undefined) {
      return;
    }
    conversation.unreadCounts[forUserId] = 0;
  }
}
