import type { Cursor, Message } from './message.entity';

export const MESSAGE_REPOSITORY = Symbol('MESSAGE_REPOSITORY');

export interface CreateMessageData {
  conversationId: string;
  senderId: string;
  text: string;
}

export interface MessageRepository {
  findPage(conversationId: string, cursor: Cursor | undefined, limit: number): Promise<Message[]>;

  create(data: CreateMessageData): Promise<Message>;

  searchBySender(senderId: string, query: string, limit: number): Promise<Message[]>;
}
