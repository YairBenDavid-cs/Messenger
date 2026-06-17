import { Injectable } from '@nestjs/common';
import { ConversationsService } from '../../../domains/conversations/application/conversations.service';
import type { ConversationView } from '../../../domains/conversations/dto/conversation-view.dto';
import { UsersService } from '../../../domains/users/application/users.service';

@Injectable()
export class ListConversationsService {
  constructor(
    private readonly conversations: ConversationsService,
    private readonly users: UsersService,
  ) {}

  async listFor(viewerId: string): Promise<ConversationView[]> {
    const conversations = await this.conversations.findConversationsFor(viewerId);

    const otherIds = conversations.map((conversation) => conversation.otherParticipantId(viewerId));
    const usersById = await this.users.findByIds(otherIds);

    return conversations.map((conversation) => {
      const otherId = conversation.otherParticipantId(viewerId);
      const other = usersById.get(otherId);
      return {
        id: conversation.id,
        participants: conversation.participantIds,
        title: other?.name ?? 'Unknown',
        avatarUrl: other?.avatarUrl ?? '',
        lastMessagePreview: conversation.lastMessagePreview,
        lastMessageAt: conversation.lastMessageAt.toISOString(),
        unreadCount: conversation.unreadFor(viewerId),
      };
    });
  }
}
