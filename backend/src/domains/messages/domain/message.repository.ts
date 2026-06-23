import type { UnitOfWork } from '../../../common/database/unit-of-work';
import type { Cursor, Message } from './message.entity';

export const MESSAGE_REPOSITORY = Symbol('MESSAGE_REPOSITORY');

export interface CreateMessageData {
  conversationId: string;
  senderId: string;
  text: string;
}

export interface MessageRepository {
  findPage(conversationId: string, cursor: Cursor | undefined, limit: number): Promise<Message[]>;

  create(data: CreateMessageData, uow?: UnitOfWork): Promise<Message>;
}
