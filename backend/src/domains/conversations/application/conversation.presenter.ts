import type { User } from '../../users/domain/user.entity';
import type { Conversation } from '../domain/conversation.entity';
import type { ConversationView } from '../dto/conversation-view.dto';

export const ConversationPresenter = {
  toView(
    conversation: Conversation,
    other: User | null | undefined,
    viewerId: string,
  ): ConversationView {
    return {
      id: conversation.id,
      participants: conversation.participantIds,
      title: other?.name ?? 'Unknown',
      avatarUrl: other?.avatarUrl ?? '',
      lastMessagePreview: conversation.lastMessagePreview,
      lastMessageAt: conversation.lastMessageAt.toISOString(),
      unreadCount: conversation.unreadFor(viewerId),
    };
  },
};
