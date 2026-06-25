import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateDirectConversationCommand } from '../../../domains/conversations/application/commands/create-direct-conversation.command';
import type { ConversationView } from '../../../domains/conversations/dto/conversation-view.dto';
import { FindUserByIdQuery } from '../../../domains/users/application/queries/find-user-by-id.query';
import { toDirectConversationView } from '../direct-conversation-view.mapper';

@Injectable()
export class CreateDirectConversationService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async create(viewerId: string, participantIds: string[]): Promise<ConversationView> {
    const otherId = participantIds.find((id) => id !== viewerId) ?? participantIds[0];

    const other = await this.queryBus.execute(new FindUserByIdQuery(otherId));
    if (other === null) {
      throw new NotFoundException('Participant not found');
    }

    const conversation = await this.commandBus.execute(
      new CreateDirectConversationCommand(viewerId, otherId),
    );

    return toDirectConversationView(conversation, other, viewerId);
  }
}
