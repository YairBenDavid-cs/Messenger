import type { Types } from 'mongoose';
import { Conversation } from '../domain/conversation.entity';
import type { ConversationType } from '../domain/conversation.entity';
import type { ConversationDocument } from './conversation.schema';

interface ConversationPlain {
  _id: Types.ObjectId;
  type: ConversationType;
  participantIds: Types.ObjectId[];
  lastMessageAt: Date;
  lastMessagePreview: string;
  createdAt: Date;
  participantKey?: string;
  unreadCounts?: Record<string, number>;
  title?: string;
  contextSummary?: string;
  summarizedUpTo?: number;
}

export const ConversationMapper = {
  toDomain(doc: ConversationDocument): Conversation {
    const plain = doc.toObject<ConversationPlain>({ flattenMaps: true });
    return new Conversation({
      id: plain._id.toString(),
      type: plain.type,
      participantIds: plain.participantIds.map((id) => id.toString()),
      lastMessagePreview: plain.lastMessagePreview,
      lastMessageAt: plain.lastMessageAt,
      createdAt: plain.createdAt,
      participantKey: plain.participantKey,
      unreadCounts: plain.unreadCounts ?? {},
      title: plain.title,
      contextSummary: plain.contextSummary,
      summarizedUpTo: plain.summarizedUpTo,
    });
  },
};
