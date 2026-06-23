export interface ConversationProps {
  id: string;
  participantIds: string[];
  participantKey: string;
  lastMessagePreview: string;
  lastMessageAt: Date;
  unreadCounts: Record<string, number>;
  createdAt?: Date;
}

export class Conversation {
  readonly id: string;
  participantIds: string[];
  participantKey: string;
  lastMessagePreview: string;
  lastMessageAt: Date;
  unreadCounts: Record<string, number>;
  readonly createdAt: Date;

  constructor(props: ConversationProps) {
    this.id = props.id;
    this.participantIds = props.participantIds;
    this.participantKey = props.participantKey;
    this.lastMessagePreview = props.lastMessagePreview;
    this.lastMessageAt = props.lastMessageAt;
    this.unreadCounts = props.unreadCounts;
    this.createdAt = props.createdAt ?? new Date();
  }

  otherParticipantId(viewerId: string): string {
    return this.participantIds.find((id) => id !== viewerId) ?? this.participantIds[0];
  }

  unreadFor(viewerId: string): number {
    return this.unreadCounts[viewerId] ?? 0;
  }
}
