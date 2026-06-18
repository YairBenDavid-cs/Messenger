import type { ClientSession } from 'mongoose';
import type { Conversation } from './conversation.entity';

export const CONVERSATION_REPOSITORY = Symbol('CONVERSATION_REPOSITORY');

export interface CreateConversationData {
  participantIds: string[];
  participantKey: string;
}

export function buildParticipantKey(idA: string, idB: string): string {
  return [idA, idB].sort().join('_');
}

export interface ConversationRepository {
  findConversationsByUserId(userId: string): Promise<Conversation[]>;

  findByConversationId(id: string, session?: ClientSession): Promise<Conversation | null>;

  findConversationByParticipantKey(participantKey: string): Promise<Conversation | null>;

  create(data: CreateConversationData): Promise<Conversation>;

  updateLastMessage(id: string, preview: string, at: Date, session?: ClientSession): Promise<void>;

  incrementUnread(id: string, forUserId: string, session?: ClientSession): Promise<void>;

  resetUnread(id: string, forUserId: string): Promise<void>;
}
