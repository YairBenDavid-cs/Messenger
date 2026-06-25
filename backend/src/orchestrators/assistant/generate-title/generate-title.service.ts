import { Injectable } from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  DEFAULT_ASSISTANT_TITLE,
  GenerateAssistantTitleQuery,
} from '../../../domains/assistant/application/queries/generate-assistant-title.query';
import { FindFirstAssistantChatMessageQuery } from '../../../domains/assistant/application/queries/find-first-assistant-chat-message.query';
import { titleEvent } from '../../../domains/assistant/application/sse-event';
import { UpdateConversationTitleCommand } from '../../../domains/conversations/application/commands/update-conversation-title.command';

@Injectable()
export class GenerateAssistantTitleService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  async generate(conversationId: string): Promise<MessageEvent | null> {
    const opener = await this.queryBus.execute(
      new FindFirstAssistantChatMessageQuery(conversationId),
    );
    const openerText = opener?.text ?? '';
    if (openerText.trim() === '') {
      return null;
    }

    const title = await this.queryBus.execute(new GenerateAssistantTitleQuery(openerText));
    if (title === DEFAULT_ASSISTANT_TITLE) {
      return null;
    }

    await this.commandBus.execute(new UpdateConversationTitleCommand(conversationId, title));
    return titleEvent(title);
  }
}
