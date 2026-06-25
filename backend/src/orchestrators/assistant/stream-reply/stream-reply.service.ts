import { Injectable } from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { concatMap, defer, EMPTY, from, merge, mergeMap, of, Observable } from 'rxjs';
import { StreamAssistantReplyCommand } from '../../../domains/assistant/application/commands/stream-assistant-reply.command';
import { FindAssistantChatMessageByIdQuery } from '../../../domains/assistant/application/queries/find-assistant-chat-message-by-id.query';
import { DEFAULT_ASSISTANT_TITLE } from '../../../domains/assistant/application/queries/generate-assistant-title.query';
import { doneEventSchema } from '../../../domains/assistant/application/sse-event';
import { UpdateConversationLastMessageCommand } from '../../../domains/conversations/application/commands/update-conversation-last-message.command';
import { GenerateAssistantTitleService } from '../generate-title/generate-title.service';
import { ResolveAssistantContextService, type ContextState } from '../resolve-context/resolve-context.service';

@Injectable()
export class StreamAssistantReplyService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly resolveContext: ResolveAssistantContextService,
    private readonly titleService: GenerateAssistantTitleService,
  ) {}

  stream(conversationId: string, userId: string): Observable<MessageEvent> {
    return defer(() => from(this.resolveContext.resolve(conversationId))).pipe(
      mergeMap((context) =>
        merge(this.reply$(conversationId, userId, context), this.title$(conversationId, context)),
      ),
    );
  }

  private reply$(
    conversationId: string,
    userId: string,
    context: ContextState,
  ): Observable<MessageEvent> {
    return defer(() =>
      from(
        this.commandBus.execute(
          new StreamAssistantReplyCommand(
            conversationId,
            userId,
            context.summary,
            context.summarizedUpTo,
          ),
        ),
      ),
    ).pipe(
      mergeMap((events: Observable<MessageEvent>) =>
        events.pipe(concatMap((event) => this.touchConversationOnDone(conversationId, event))),
      ),
    );
  }

  private title$(conversationId: string, context: ContextState): Observable<MessageEvent> {
    if (!this.needsTitle(context.title)) {
      return EMPTY;
    }
    return defer(() => from(this.titleService.generate(conversationId))).pipe(
      mergeMap((event) => (event === null ? EMPTY : of(event))),
    );
  }

  private needsTitle(title: string | undefined): boolean {
    return title === undefined || title.trim() === '' || title === DEFAULT_ASSISTANT_TITLE;
  }

  private async touchConversationOnDone(
    conversationId: string,
    event: MessageEvent,
  ): Promise<MessageEvent> {
    if (event.type === 'done') {
      const { messageId } = doneEventSchema.parse(event.data);
      const turn = await this.queryBus.execute(new FindAssistantChatMessageByIdQuery(messageId));
      if (turn !== null) {
        await this.commandBus.execute(
          new UpdateConversationLastMessageCommand(conversationId, turn.text, turn.createdAt),
        );
      }
    }
    return event;
  }
}
