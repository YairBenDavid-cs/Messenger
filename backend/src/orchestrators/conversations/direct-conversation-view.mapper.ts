import type { Conversation } from '../../domains/conversations/domain/conversation.entity';
import type { DirectConversationView } from '../../domains/conversations/dto/conversation-view.dto';
import type { PublicUser } from '../../domains/users/dto/public-user.dto';

export function toDirectConversationView(
  conversation: Conversation,
  other: PublicUser | null | undefined,
  viewerId: string,
): DirectConversationView {
  return {
    id: conversation.id,
    type: 'direct',
    participants: conversation.participantIds,
    title: other?.name ?? 'Unknown',
    avatarUrl: other?.avatarUrl ?? '',
    lastMessagePreview: conversation.lastMessagePreview,
    lastMessageAt: conversation.lastMessageAt.toISOString(),
    unreadCount: conversation.unreadFor(viewerId),
  };
}
