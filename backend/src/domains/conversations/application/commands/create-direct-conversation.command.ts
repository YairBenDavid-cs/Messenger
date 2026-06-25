import { ConflictException, Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggedHandler } from '../../../../common/cqrs/logged-handler';
import { isDuplicateKeyError } from '../../../../common/database/mongo-errors';
import type { Conversation } from '../../domain/conversation.entity';
import {
  CONVERSATION_REPOSITORY,
  buildParticipantKey,
  type ConversationRepository,
} from '../../domain/conversation.repository';

export class CreateDirectConversationCommand extends Command<Conversation> {
  constructor(
    public readonly viewerId: string,
    public readonly otherId: string,
  ) {
    super();
  }
}

@CommandHandler(CreateDirectConversationCommand)
export class CreateDirectConversationHandler
  extends LoggedHandler<CreateDirectConversationCommand, Conversation>
  implements ICommandHandler<CreateDirectConversationCommand>
{
  constructor(
    @Inject(CONVERSATION_REPOSITORY) private readonly conversations: ConversationRepository,
  ) {
    super();
  }

  protected async handle(command: CreateDirectConversationCommand): Promise<Conversation> {
    const participantKey = buildParticipantKey(command.viewerId, command.otherId);

    const existing = await this.conversations.findConversationByParticipantKey(participantKey);
    if (existing !== null) {
      throw new ConflictException('Conversation already exists');
    }

    try {
      return await this.conversations.createDirect({
        participantIds: [command.viewerId, command.otherId],
        participantKey,
      });
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException('Conversation already exists');
      }
      throw error;
    }
  }
}
