export type ConversationType = 'direct' | 'assistant';

export interface ConversationProps {
  id: string;
  type: ConversationType;
  participantIds: string[];
  lastMessagePreview: string;
  lastMessageAt: Date;
  participantKey?: string;
  unreadCounts?: Record<string, number>;
  title?: string;
  contextSummary?: string;
  summarizedUpTo?: number;
  createdAt?: Date;
}

export class Conversation {
  readonly id: string;
  readonly type: ConversationType;
  participantIds: string[];
  lastMessagePreview: string;
  lastMessageAt: Date;
  participantKey?: string;
  unreadCounts: Record<string, number>;
  title?: string;
  contextSummary?: string;
  summarizedUpTo?: number;
  readonly createdAt: Date;

  constructor(props: ConversationProps) {
    this.id = props.id;
    this.type = props.type;
    this.participantIds = props.participantIds;
    this.lastMessagePreview = props.lastMessagePreview;
    this.lastMessageAt = props.lastMessageAt;
    this.participantKey = props.participantKey;
    this.unreadCounts = props.unreadCounts ?? {};
    this.title = props.title;
    this.contextSummary = props.contextSummary;
    this.summarizedUpTo = props.summarizedUpTo;
    this.createdAt = props.createdAt ?? new Date();
  }

  otherParticipantId(viewerId: string): string {
    return this.participantIds.find((id) => id !== viewerId) ?? this.participantIds[0];
  }

  unreadFor(viewerId: string): number {
    return this.unreadCounts[viewerId] ?? 0;
  }
}
