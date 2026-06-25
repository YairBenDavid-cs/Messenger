import { Inject, Injectable } from '@nestjs/common';
import { z } from 'zod';
import type { LlmToolSpec } from '../domain/llm-provider';
import { MESSAGE_SEARCH_PORT, type MessageSearchPort } from '../domain/message-search.port';
import type { AssistantTool } from './assistant-tool';

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 20;

const inputSchema = z.object({
  query: z.string().min(1).max(200),
  limit: z.number().int().min(1).max(MAX_LIMIT).optional(),
});

const outputSchema = z.object({
  matches: z.array(z.object({ text: z.string(), createdAt: z.string() })),
});

@Injectable()
export class SearchMyMessagesTool implements AssistantTool {
  readonly spec: LlmToolSpec = {
    name: 'search_my_messages',
    description:
      "Search the current user's own past messages by keyword. Returns matching message texts with timestamps, newest first. Only ever searches the user's own messages.",
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Keyword or phrase to search for in the user\'s messages.',
        },
        limit: {
          type: 'integer',
          description: `Maximum number of matches to return (1-${MAX_LIMIT}, default ${DEFAULT_LIMIT}).`,
          minimum: 1,
          maximum: MAX_LIMIT,
        },
      },
      required: ['query'],
      additionalProperties: false,
    },
  };

  constructor(
    @Inject(MESSAGE_SEARCH_PORT) private readonly messageSearch: MessageSearchPort,
  ) {}

  async run(rawInput: unknown, userId: string): Promise<string> {
    const parsed = inputSchema.safeParse(rawInput);
    if (!parsed.success) {
      const reason = parsed.error.issues
        .map((issue) => `${issue.path.join('.') || 'input'}: ${issue.message}`)
        .join('; ');
      return JSON.stringify({ error: `invalid arguments: ${reason}` });
    }
    const input = parsed.data;
    const matches = await this.messageSearch.search(
      userId,
      input.query,
      input.limit ?? DEFAULT_LIMIT,
    );
    return JSON.stringify(outputSchema.parse({ matches }));
  }
}
