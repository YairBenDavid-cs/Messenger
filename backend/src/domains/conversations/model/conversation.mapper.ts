import { Conversation } from '../domain/conversation.entity';
import type { ConversationDocument } from './conversation.schema';

export const ConversationMapper = {
  toDomain(doc: ConversationDocument): Conversation {
    return new Conversation({
      id: doc._id.toString(),
      participantIds: doc.participantIds.map((id) => id.toString()),
      participantKey: doc.participantKey,
      lastMessagePreview: doc.lastMessagePreview,
      lastMessageAt: doc.lastMessageAt,
      unreadCounts: Object.fromEntries(doc.unreadCounts),
      createdAt: doc.createdAt,
    });
  },
};
