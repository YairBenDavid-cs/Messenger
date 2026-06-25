import type { Conversation, ConversationType } from './conversation.entity';

export const CONVERSATION_REPOSITORY = Symbol('CONVERSATION_REPOSITORY');

export interface CreateDirectConversationData {
  participantIds: string[];
  participantKey: string;
}

export function buildParticipantKey(idA: string, idB: string): string {
  return [idA, idB].sort().join('_');
}

export interface ConversationRepository {
  findConversationsByUserId(userId: string, type?: ConversationType): Promise<Conversation[]>;

  findByConversationId(id: string): Promise<Conversation | null>;

  findConversationByParticipantKey(participantKey: string): Promise<Conversation | null>;

  createDirect(data: CreateDirectConversationData): Promise<Conversation>;

  createAssistant(ownerId: string): Promise<Conversation>;

  updateLastMessage(id: string, preview: string, at: Date): Promise<void>;

  updateTitle(id: string, title: string): Promise<void>;

  updateContextSummary(id: string, summary: string, summarizedUpTo: number): Promise<void>;

  incrementUnread(id: string, forUserId: string): Promise<void>;

  resetUnread(id: string, forUserId: string): Promise<void>;
}
