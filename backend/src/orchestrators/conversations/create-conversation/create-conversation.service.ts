import { Injectable, NotFoundException } from '@nestjs/common';
import { ConversationsService } from '../../../domains/conversations/application/conversations.service';
import type { ConversationView } from '../../../domains/conversations/dto/conversation-view.dto';
import { UsersService } from '../../../domains/users/application/users.service';

@Injectable()
export class CreateConversationService {
  constructor(
    private readonly conversations: ConversationsService,
    private readonly users: UsersService,
  ) {}

  async create(viewerId: string, participantIds: string[]): Promise<ConversationView> {
    const otherId = participantIds.find((id) => id !== viewerId) ?? participantIds[0];

    const other = await this.users.findById(otherId);
    if (other === null) {
      throw new NotFoundException('Participant not found');
    }

    const conversation = await this.conversations.createConversation(viewerId, otherId);

    return {
      id: conversation.id,
      participants: conversation.participantIds,
      title: other.name,
      avatarUrl: other.avatarUrl ?? '',
      lastMessagePreview: conversation.lastMessagePreview,
      lastMessageAt: conversation.lastMessageAt.toISOString(),
      unreadCount: conversation.unreadFor(viewerId),
    };
  }
}
