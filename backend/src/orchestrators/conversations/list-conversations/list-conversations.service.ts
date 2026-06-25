import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { AssistantConversationPresenter } from '../../../domains/conversations/application/assistant-conversation.presenter';
import { FindConversationsForUserQuery } from '../../../domains/conversations/application/queries/find-conversations-for-user.query';
import type { ConversationType } from '../../../domains/conversations/domain/conversation.entity';
import type { ConversationView } from '../../../domains/conversations/dto/conversation-view.dto';
import { FindUsersByIdsQuery } from '../../../domains/users/application/queries/find-users-by-ids.query';
import { toDirectConversationView } from '../direct-conversation-view.mapper';

@Injectable()
export class ListConversationsService {
  constructor(private readonly queryBus: QueryBus) {}

  async listFor(viewerId: string, type?: ConversationType): Promise<ConversationView[]> {
    const conversations = await this.queryBus.execute(
      new FindConversationsForUserQuery(viewerId, type),
    );


    const otherIds = conversations
      .filter((conversation) => conversation.type === 'direct')
      .map((conversation) => conversation.otherParticipantId(viewerId));
    const usersById = await this.queryBus.execute(new FindUsersByIdsQuery(otherIds));

    return conversations.map((conversation) => {
      if (conversation.type === 'assistant') {
        return AssistantConversationPresenter.toView(conversation);
      }
      const other = usersById.get(conversation.otherParticipantId(viewerId));
      return toDirectConversationView(conversation, other, viewerId);
    });
  }
}
