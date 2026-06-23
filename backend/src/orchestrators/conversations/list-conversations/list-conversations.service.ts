import { Injectable } from '@nestjs/common';
import { ConversationPresenter } from '../../../domains/conversations/application/conversation.presenter';
import { ConversationsService } from '../../../domains/conversations/application/conversations.service';
import type { ConversationView } from '../../../domains/conversations/dto/conversation-view.dto';
import { UsersService } from '../../../domains/users/application/users.service';
import { QueryBus } from '@nestjs/cqrs';

@Injectable()
export class ListConversationsService {
  constructor(
    private readonly conversations: ConversationsService,
    private readonly users: UsersService,
    private readonly queryBus: QueryBus,
  ) {}

  async listFor(viewerId: string): Promise<ConversationView[]> {
    const conversations = await this.conversations.findConversationsFor(viewerId);

    const otherIds = conversations.map((conversation) => conversation.otherParticipantId(viewerId));
    const usersById = await this.users.findByIds(otherIds);

    return conversations.map((conversation) => {
      const other = usersById.get(conversation.otherParticipantId(viewerId));
      return ConversationPresenter.toView(conversation, other, viewerId);
    });
  }
}
