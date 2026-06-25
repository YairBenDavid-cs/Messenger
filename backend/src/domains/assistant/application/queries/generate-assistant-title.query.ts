import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { z } from 'zod';
import { LoggedHandler } from '../../../../common/cqrs/logged-handler';
import { LLM_PROVIDER, type LlmProvider } from '../../domain/llm-provider';
import { PromptRepository } from '../../prompts/prompt.repository';

export const DEFAULT_ASSISTANT_TITLE = 'New chat';

const MAX_TITLE_LENGTH = 60;
const TITLE_MAX_TOKENS = 32;

const titleSchema = z.object({ title: z.string().trim().min(1).max(MAX_TITLE_LENGTH) });

export class GenerateAssistantTitleQuery extends Query<string> {
  constructor(public readonly firstUserMessage: string) {
    super();
  }
}

@QueryHandler(GenerateAssistantTitleQuery)
export class GenerateAssistantTitleHandler
  extends LoggedHandler<GenerateAssistantTitleQuery, string>
  implements IQueryHandler<GenerateAssistantTitleQuery, string>
{
  private readonly titleModel: string;

  constructor(
    private readonly prompts: PromptRepository,
    config: ConfigService,
    @Inject(LLM_PROVIDER) private readonly llm: LlmProvider,
  ) {
    super();
    this.titleModel = config.get<string>('LLM_TITLE_MODEL', 'gpt-4o-mini');
  }

  protected async handle(query: GenerateAssistantTitleQuery): Promise<string> {
    try {
      const raw = await this.llm.generateText({
        system: this.prompts.getTitlePrompt(),
        messages: [{ role: 'user', content: query.firstUserMessage }],
        model: this.titleModel,
        maxTokens: TITLE_MAX_TOKENS,
      });
      return parseTitle(raw);
    } catch {
      return DEFAULT_ASSISTANT_TITLE;
    }
  }
}

function parseTitle(raw: string): string {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return DEFAULT_ASSISTANT_TITLE;
  }
  const result = titleSchema.safeParse(json);
  return result.success ? result.data.title : DEFAULT_ASSISTANT_TITLE;
}
