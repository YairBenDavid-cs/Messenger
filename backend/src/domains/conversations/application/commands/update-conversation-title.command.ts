import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggedHandler } from '../../../../common/cqrs/logged-handler';
import {
  CONVERSATION_REPOSITORY,
  type ConversationRepository,
} from '../../domain/conversation.repository';

export class UpdateConversationTitleCommand extends Command<void> {
  constructor(
    public readonly conversationId: string,
    public readonly title: string,
  ) {
    super();
  }
}

@CommandHandler(UpdateConversationTitleCommand)
export class UpdateConversationTitleHandler
  extends LoggedHandler<UpdateConversationTitleCommand, void>
  implements ICommandHandler<UpdateConversationTitleCommand>
{
  constructor(
    @Inject(CONVERSATION_REPOSITORY) private readonly conversations: ConversationRepository,
  ) {
    super();
  }

  protected handle(command: UpdateConversationTitleCommand): Promise<void> {
    return this.conversations.updateTitle(command.conversationId, command.title);
  }
}
