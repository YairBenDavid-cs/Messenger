import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggedHandler } from '../../../../common/cqrs/logged-handler';
import {
  CONVERSATION_REPOSITORY,
  type ConversationRepository,
} from '../../domain/conversation.repository';

export class IncrementConversationUnreadCommand extends Command<void> {
  constructor(
    public readonly conversationId: string,
    public readonly userIds: string[],
  ) {
    super();
  }
}

@CommandHandler(IncrementConversationUnreadCommand)
export class IncrementConversationUnreadHandler
  extends LoggedHandler<IncrementConversationUnreadCommand, void>
  implements ICommandHandler<IncrementConversationUnreadCommand>
{
  constructor(
    @Inject(CONVERSATION_REPOSITORY) private readonly conversations: ConversationRepository,
  ) {
    super();
  }

  protected async handle(command: IncrementConversationUnreadCommand): Promise<void> {
    for (const userId of command.userIds) {
      await this.conversations.incrementUnread(command.conversationId, userId);
    }
  }
}
