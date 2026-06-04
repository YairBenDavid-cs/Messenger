import { randomUUID } from 'crypto';
import type { IMessageRepository, Message, MessagesPage } from './repositories/IMessageRepository';
import type { ConversationService } from '../conversations/conversations.service';

export class MessageService {
  constructor(
    private readonly messageRepo: IMessageRepository,
    private readonly conversationService: ConversationService,
  ) {}

  async getMessages(
    conversationId: string,
    userId: string,
    cursor?: string,
  ): Promise<MessagesPage> {
    await this.conversationService.getParticipantConversation(conversationId, userId);
    await this.conversationService.markConversationRead(conversationId, userId);
    return this.messageRepo.findMessagesByConversation(conversationId, cursor);
  }

  async sendMessage(conversationId: string, senderId: string, text: string): Promise<Message> {
    const conversation = await this.conversationService.getParticipantConversation(
      conversationId,
      senderId,
    );

    const message: Message = {
      id: randomUUID(),
      conversationId,
      senderId,
      text,
      createdAt: new Date().toISOString(),
    };
    await this.messageRepo.saveMessage(message);

    await this.conversationService.recordNewMessage(conversation, senderId, text, message.createdAt);

    return message;
  }
}
