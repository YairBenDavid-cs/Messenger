import type { Message, MessagesPage } from '../entities/message.entity';

export const MESSAGE_REPOSITORY = Symbol('MESSAGE_REPOSITORY');

export interface MessageRepository {
  findMessagesByConversation(
    conversationId: string,
    cursor?: string,
    limit?: number,
  ): Promise<MessagesPage>;

  saveMessage(message: Message): Promise<Message>;
}
