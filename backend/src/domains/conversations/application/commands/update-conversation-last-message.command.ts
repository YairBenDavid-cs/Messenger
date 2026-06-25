import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggedHandler } from '../../../../common/cqrs/logged-handler';
import {
  CONVERSATION_REPOSITORY,
  type ConversationRepository,
} from '../../domain/conversation.repository';

export class UpdateConversationLastMessageCommand extends Command<void> {
  constructor(
    public readonly conversationId: string,
    public readonly preview: string,
    public readonly at: Date,
  ) {
    super();
  }
}

@CommandHandler(UpdateConversationLastMessageCommand)
export class UpdateConversationLastMessageHandler
  extends LoggedHandler<UpdateConversationLastMessageCommand, void>
  implements ICommandHandler<UpdateConversationLastMessageCommand>
{
  constructor(
    @Inject(CONVERSATION_REPOSITORY) private readonly conversations: ConversationRepository,
  ) {
    super();
  }

  protected handle(command: UpdateConversationLastMessageCommand): Promise<void> {
    return this.conversations.updateLastMessage(
      command.conversationId,
      command.preview,
      command.at,
    );
  }
}
