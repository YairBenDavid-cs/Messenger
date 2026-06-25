import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggedHandler } from '../../../../common/cqrs/logged-handler';
import type { AssistantChatMessage, AssistantChatMessageFinishReason, AssistantChatMessageRole } from '../../domain/assistant-chat-message.entity';
import { ASSISTANT_CHAT_MESSAGE_REPOSITORY, type AssistantChatMessageRepository } from '../../domain/assistant-chat-message.repository';

export class AppendAssistantChatMessageCommand extends Command<AssistantChatMessage> {
  constructor(
    public readonly conversationId: string,
    public readonly role: AssistantChatMessageRole,
    public readonly text: string,
    public readonly finishReason?: AssistantChatMessageFinishReason,
  ) {
    super();
  }
}

@CommandHandler(AppendAssistantChatMessageCommand)
export class AppendAssistantChatMessageHandler
  extends LoggedHandler<AppendAssistantChatMessageCommand, AssistantChatMessage>
  implements ICommandHandler<AppendAssistantChatMessageCommand>
{
  constructor(
    @Inject(ASSISTANT_CHAT_MESSAGE_REPOSITORY)
    private readonly turns: AssistantChatMessageRepository,
  ) {
    super();
  }

  protected handle(command: AppendAssistantChatMessageCommand): Promise<AssistantChatMessage> {
    return this.turns.create({
      conversationId: command.conversationId,
      role: command.role,
      text: command.text,
      finishReason: command.finishReason,
    });
  }
}
