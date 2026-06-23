import type { UnitOfWork } from '../../../common/database/unit-of-work';
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

  findByConversationId(id: string, uow?: UnitOfWork): Promise<Conversation | null>;

  findConversationByParticipantKey(participantKey: string): Promise<Conversation | null>;

  create(data: CreateConversationData): Promise<Conversation>;

  updateLastMessage(id: string, preview: string, at: Date, uow?: UnitOfWork): Promise<void>;

  incrementUnread(id: string, forUserId: string, uow?: UnitOfWork): Promise<void>;

  resetUnread(id: string, forUserId: string): Promise<void>;
}
