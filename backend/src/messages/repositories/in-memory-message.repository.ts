import { Injectable } from '@nestjs/common';
import type { Message, MessagesPage } from '../entities/message.entity';
import type { MessageRepository } from './message.repository.interface';

const DEFAULT_LIMIT = 20;

@Injectable()
export class InMemoryMessageRepository implements MessageRepository {
  private readonly messagesByConversation: Map<string, Message[]>;

  constructor(seed: Record<string, Message[]>) {
    this.messagesByConversation = new Map(
      Object.entries(seed).map(([conversationId, messages]) => [conversationId, [...messages]]),
    );
  }

  async findMessagesByConversation(
    conversationId: string,
    cursor?: string,
    limit: number = DEFAULT_LIMIT,
  ): Promise<MessagesPage> {
    const all = this.messagesByConversation.get(conversationId) ?? [];

    const cursorTime = cursor !== undefined ? this.decodeCursor(cursor) : undefined;
    const eligible =
      cursorTime !== undefined
        ? all.filter((message) => message.createdAt < cursorTime)
        : all;

    const page = eligible.slice(Math.max(0, eligible.length - limit));

    const hasMore = eligible.length > limit;
    const oldest = page[0];
    const nextCursor = hasMore && oldest !== undefined ? this.encodeCursor(oldest.createdAt) : null;

    return { messages: page, nextCursor };
  }

  async saveMessage(message: Message): Promise<Message> {
    const existing = this.messagesByConversation.get(message.conversationId) ?? [];
    existing.push(message);
    this.messagesByConversation.set(message.conversationId, existing);
    return message;
  }

  private encodeCursor(isoTimestamp: string): string {
    return Buffer.from(isoTimestamp).toString('base64');
  }

  private decodeCursor(cursor: string): string {
    return Buffer.from(cursor, 'base64').toString('utf8');
  }
}
