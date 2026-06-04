import type { IMessageRepository, Message, MessagesPage } from './IMessageRepository';

const DEFAULT_LIMIT = 20;

export class InMemoryMessageRepository implements IMessageRepository {
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

    const newestFirst = [...all].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const startIndex =
      cursor !== undefined
        ? newestFirst.findIndex((message) => message.createdAt < this.decodeCursor(cursor))
        : 0;

    const fromCursor = startIndex === -1 ? [] : newestFirst.slice(startIndex);
    const page = fromCursor.slice(0, limit);

    const hasMore = fromCursor.length > limit;
    const last = page[page.length - 1];
    const nextCursor = hasMore && last !== undefined ? this.encodeCursor(last.createdAt) : null;

    return { messages: [...page].reverse(), nextCursor };
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
