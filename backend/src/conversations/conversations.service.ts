import { randomUUID } from 'crypto';
import type { Conversation, IConversationRepository } from './repositories/IConversationRepository';
import type { UserService } from '../users/user.service';
import { badRequest, conflict, forbidden, notFound } from '../shared/AppError';

export interface ConversationDTO {
  id: string;
  participants: string[];
  title: string;
  avatarUrl: string;
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
}

export class ConversationService {
  constructor(
    private readonly conversationRepo: IConversationRepository,
    private readonly userService: UserService,
  ) {}

  async listConversations(userId: string): Promise<ConversationDTO[]> {
    const conversations = await this.conversationRepo.findAllConversationsByUserId(userId);
    const sorted = [...conversations].sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
    );
    return Promise.all(sorted.map((conversation) => this.enrich(conversation, userId)));
  }

  async createConversation(creatorId: string, participantIds: string[]): Promise<ConversationDTO> {
    const otherId = participantIds[0];
    if (otherId === undefined || otherId === creatorId) {
      throw badRequest('A conversation needs exactly one other participant');
    }

    const other = await this.userService.findById(otherId);
    if (other === null) {
      throw notFound('Participant not found');
    }

    const existing = await this.conversationRepo.findConversationByParticipants(creatorId, otherId);
    if (existing !== null) {
      throw conflict('Conversation already exists');
    }

    const conversation: Conversation = {
      id: randomUUID(),
      participantIds: [creatorId, otherId],
      lastMessagePreview: '',
      lastMessageAt: new Date().toISOString(),
      unreadCounts: { [creatorId]: 0, [otherId]: 0 },
    };
    await this.conversationRepo.saveConversation(conversation);

    return this.enrich(conversation, creatorId);
  }

  async getParticipantConversation(conversationId: string, userId: string): Promise<Conversation> {
    const conversation = await this.conversationRepo.findConversationById(conversationId);
    if (conversation === null) {
      throw notFound('Conversation not found');
    }
    if (!conversation.participantIds.includes(userId)) {
      throw forbidden('Not a participant of this conversation');
    }
    return conversation;
  }

  async markConversationRead(conversationId: string, userId: string): Promise<void> {
    await this.conversationRepo.resetConversationUnread(conversationId, userId);
  }

  async recordNewMessage(
    conversation: Conversation,
    senderId: string,
    preview: string,
    at: string,
  ): Promise<void> {
    await this.conversationRepo.updateConversationLastMessage(conversation.id, preview, at);
    for (const participantId of conversation.participantIds) {
      if (participantId !== senderId) {
        await this.conversationRepo.incrementConversationUnread(conversation.id, participantId);
      }
    }
  }

  private async enrich(conversation: Conversation, viewerId: string): Promise<ConversationDTO> {
    const otherId = conversation.participantIds.find((id) => id !== viewerId) ?? viewerId;
    const other = await this.userService.findById(otherId);
    return {
      id: conversation.id,
      participants: conversation.participantIds,
      title: other?.username ?? 'Unknown',
      avatarUrl: other?.avatarUrl ?? '',
      lastMessagePreview: conversation.lastMessagePreview,
      lastMessageAt: conversation.lastMessageAt,
      unreadCount: conversation.unreadCounts[viewerId] ?? 0,
    };
  }
}
