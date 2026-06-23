import { Injectable } from '@nestjs/common';
import { ConversationsService } from '../../../domains/conversations/application/conversations.service';
import { MessagesService } from '../../../domains/messages/application/messages.service';
import type { MessagesPage } from '../../../domains/messages/dto/message-response.dto';

@Injectable()
export class FetchMessagesService {
  constructor(
    private readonly messages: MessagesService,
    private readonly conversations: ConversationsService,
  ) {}

  async list(
    conversationId: string,
    viewerId: string,
    cursor?: string,
    limit?: number,
  ): Promise<MessagesPage> {
    await this.conversations.markRead(conversationId, viewerId);
    return this.messages.getMessages(conversationId, cursor, limit);
  }
}
