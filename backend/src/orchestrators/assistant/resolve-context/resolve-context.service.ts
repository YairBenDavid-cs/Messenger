import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  SummarizeConversationContextQuery,
  type SummaryRollUp,
} from '../../../domains/assistant/application/queries/summarize-conversation-context.query';
import { UpdateConversationContextSummaryCommand } from '../../../domains/conversations/application/commands/update-conversation-context-summary.command';
import { FindConversationByIdQuery } from '../../../domains/conversations/application/queries/find-conversation-by-id.query';

export interface ContextState {
  summary: string;
  summarizedUpTo: number;
  title: string | undefined;
}
@Injectable()
export class ResolveAssistantContextService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  async resolve(conversationId: string): Promise<ContextState> {
    const conversation = await this.queryBus.execute(
      new FindConversationByIdQuery(conversationId),
    );
    const title = conversation?.title;
    let summary = conversation?.contextSummary ?? '';
    let summarizedUpTo = conversation?.summarizedUpTo ?? 0;

    const rolled: SummaryRollUp | null = await this.queryBus.execute(
      new SummarizeConversationContextQuery(conversationId, summary, summarizedUpTo),
    );
    if (rolled !== null) {
      await this.commandBus.execute(
        new UpdateConversationContextSummaryCommand(
          conversationId,
          rolled.summary,
          rolled.summarizedUpTo,
        ),
      );
      summary = rolled.summary;
      summarizedUpTo = rolled.summarizedUpTo;
    }

    return { summary, summarizedUpTo, title };
  }
}
