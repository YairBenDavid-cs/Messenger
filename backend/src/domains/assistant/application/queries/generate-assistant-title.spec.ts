import { ConfigService } from '@nestjs/config';
import type {
  LlmCompletionRequest,
  LlmProvider,
  LlmStreamEvent,
} from '../../domain/llm-provider';
import { PromptRepository } from '../../prompts/prompt.repository';
import {
  DEFAULT_ASSISTANT_TITLE,
  GenerateAssistantTitleHandler,
  GenerateAssistantTitleQuery,
} from './generate-assistant-title.query';


class TitleFakeLlm implements LlmProvider {
  constructor(private readonly reply: () => Promise<string>) {}

  stream(_request: LlmCompletionRequest): AsyncIterable<LlmStreamEvent> {
    return (async function* () {})();
  }

  generateText(_request: LlmCompletionRequest): Promise<string> {
    return this.reply();
  }
}

function handler(reply: () => Promise<string>): GenerateAssistantTitleHandler {
  return new GenerateAssistantTitleHandler(
    new PromptRepository(),
    new ConfigService({}),
    new TitleFakeLlm(reply),
  );
}

const query = new GenerateAssistantTitleQuery('Help me plan a trip to Japan');

describe('GenerateAssistantTitleHandler (Zod-validated structured output)', () => {
  it('accepts a well-formed JSON title', async () => {
    const result = await handler(() => Promise.resolve('{"title":"Planning a Japan trip"}')).execute(query);
    expect(result).toBe('Planning a Japan trip');
  });

  it('falls back to the default when the model returns non-JSON', async () => {
    const result = await handler(() => Promise.resolve('Sure! Here is a title.')).execute(query);
    expect(result).toBe(DEFAULT_ASSISTANT_TITLE);
  });

  it('falls back when the JSON is missing the title field', async () => {
    const result = await handler(() => Promise.resolve('{"name":"oops"}')).execute(query);
    expect(result).toBe(DEFAULT_ASSISTANT_TITLE);
  });

  it('falls back when the title is empty (fails the schema)', async () => {
    const result = await handler(() => Promise.resolve('{"title":"   "}')).execute(query);
    expect(result).toBe(DEFAULT_ASSISTANT_TITLE);
  });

  it('fails closed to the default when the provider throws', async () => {
    const result = await handler(() => Promise.reject(new Error('provider down'))).execute(query);
    expect(result).toBe(DEFAULT_ASSISTANT_TITLE);
  });
});
