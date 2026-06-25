import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { LoggedHandler } from '../../../../common/cqrs/logged-handler';
import type { AssistantChatMessage } from '../../domain/assistant-chat-message.entity';
import { ASSISTANT_CHAT_MESSAGE_REPOSITORY, type AssistantChatMessageRepository } from '../../domain/assistant-chat-message.repository';
import { DEFAULT_CONTEXT_BUDGET, historyBudget, planRollUp } from '../../domain/context/context-budget';
import { estimateTokens } from '../../domain/context/token-estimate';
import { LLM_PROVIDER, type LlmMessage, type LlmProvider } from '../../domain/llm-provider';
import { PromptRepository } from '../../prompts/prompt.repository';

// The rolling summary folds up to ~70% of the active window each time, so it needs
// room to retain the durable facts from a large span without itself growing
// unbounded (it is re-fed and re-deducted from the budget every turn).
const MAX_SUMMARY_CHARS = 2400;
const SUMMARY_MAX_TOKENS = 512;

export interface SummaryRollUp {
  summary: string;
  summarizedUpTo: number;
}

export class SummarizeConversationContextQuery extends Query<SummaryRollUp | null> {
  constructor(
    public readonly conversationId: string,
    public readonly previousSummary: string,
    public readonly summarizedUpTo: number,
  ) {
    super();
  }
}

@QueryHandler(SummarizeConversationContextQuery)
export class SummarizeConversationContextHandler
  extends LoggedHandler<SummarizeConversationContextQuery, SummaryRollUp | null>
  implements IQueryHandler<SummarizeConversationContextQuery, SummaryRollUp | null>
{
  private readonly summaryModel: string;

  constructor(
    @Inject(ASSISTANT_CHAT_MESSAGE_REPOSITORY)
    private readonly turns: AssistantChatMessageRepository,
    private readonly prompts: PromptRepository,
    config: ConfigService,
    @Inject(LLM_PROVIDER) private readonly llm: LlmProvider,
  ) {
    super();
    this.summaryModel = config.get<string>('LLM_SUMMARY_MODEL', 'gpt-4o-mini');
  }

  protected async handle(query: SummarizeConversationContextQuery): Promise<SummaryRollUp | null> {
    const turns = await this.turns.findByConversationId(query.conversationId);
    const budgetTokens = historyBudget(DEFAULT_CONTEXT_BUDGET, estimateTokens(query.previousSummary));
    const plan = planRollUp(turns, query.summarizedUpTo, budgetTokens);
    if (plan === null) {
      return null;
    }

    const head = turns.slice(query.summarizedUpTo, plan.foldUpTo);
    if (head.length === 0) {
      return null;
    }

    try {
      const raw = await this.llm.generateText({
        system: this.prompts.getSummaryPrompt(),
        messages: buildSummaryInput(query.previousSummary, head),
        model: this.summaryModel,
        maxTokens: SUMMARY_MAX_TOKENS,
      });
      const summary = raw.trim().slice(0, MAX_SUMMARY_CHARS);
      if (summary === '') {
        return null;
      }
      return { summary, summarizedUpTo: plan.foldUpTo };
    } catch {
      return null;
    }
  }
}

function buildSummaryInput(previousSummary: string, head: AssistantChatMessage[]): LlmMessage[] {
  const transcript = head.map((turn) => `${turn.role}: ${turn.text}`).join('\n');
  const intro =
    previousSummary.trim() === ''
      ? 'There is no previous summary yet. Summarize the following messages:'
      : `Previous summary:\n${previousSummary}\n\nFold in the following new messages:`;
  return [{ role: 'user', content: `${intro}\n\n${transcript}` }];
}
