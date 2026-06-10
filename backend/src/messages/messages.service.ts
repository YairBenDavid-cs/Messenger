import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ConversationsService } from '../conversations/conversations.service';
import type { Message, MessagesPage } from './entities/message.entity';
import { MESSAGE_REPOSITORY } from './repositories/message.repository.interface';
import type { MessageRepository } from './repositories/message.repository.interface';

@Injectable()
export class MessagesService {
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messages: MessageRepository,
    private readonly conversations: ConversationsService,
  ) {}

  async getMessages(
    conversationId: string,
    userId: string,
    cursor?: string,
  ): Promise<MessagesPage> {
    await this.conversations.markRead(conversationId, userId);
    return await this.messages.findMessagesByConversation(conversationId, cursor);
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    text: string,
  ): Promise<Message> {
    const message: Message = {
      id: randomUUID(),
      conversationId,
      senderId,
      text,
      createdAt: new Date().toISOString(),
    };
    const saved = await this.messages.saveMessage(message);
    await this.conversations.recordNewMessage(conversationId, senderId, text, saved.createdAt);
    return saved;
  }
}
