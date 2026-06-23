import { Injectable, NotFoundException } from '@nestjs/common';
import { ConversationPresenter } from '../../../domains/conversations/application/conversation.presenter';
import { ConversationsService } from '../../../domains/conversations/application/conversations.service';
import type { ConversationView } from '../../../domains/conversations/dto/conversation-view.dto';
import { FindUserByIdQuery, UsersService } from '../../../domains/users/application/users.service';
import { QueryBus } from '@nestjs/cqrs';

@Injectable()
export class CreateConversationService {
  constructor(
    private readonly conversations: ConversationsService,
    private readonly queryBus: QueryBus,
  ) {}

  async create(viewerId: string, participantIds: string[]): Promise<ConversationView> {
    const otherId = participantIds.find((id) => id !== viewerId) ?? participantIds[0];

    const other = await this.queryBus.execute(new FindUserByIdQuery(otherId));
    if (other === null) {
      throw new NotFoundException('Participant not found');
    }

    const conversation = await this.conversations.createConversation(viewerId, otherId);

    return ConversationPresenter.toView(conversation, other, viewerId);
  }
}
