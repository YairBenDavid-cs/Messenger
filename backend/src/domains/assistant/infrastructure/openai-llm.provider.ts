import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources/chat/completions';
import type {
  LlmCompletionRequest,
  LlmFinishReason,
  LlmMessage,
  LlmProvider,
  LlmStreamEvent,
  LlmToolSpec,
} from '../domain/llm-provider';

interface ToolCallAccumulator {
  id: string;
  name: string;
  args: string;
}

@Injectable()
export class OpenAiLlmProvider implements LlmProvider {
  private readonly client: OpenAI;
  private readonly defaultModel: string;
  private readonly defaultMaxTokens: number;

  constructor(config: ConfigService) {
    this.client = new OpenAI({
      apiKey: config.getOrThrow<string>('OPENAI_API_KEY'),
    });
    this.defaultModel = config.get<string>('LLM_MODEL', 'gpt-4o');
    const maxTokens = config.get<string>('LLM_MAX_TOKENS');
    this.defaultMaxTokens = maxTokens ? Number(maxTokens) : 1024;
  }

  async *stream(request: LlmCompletionRequest): AsyncIterable<LlmStreamEvent> {
    const tools = request.tools?.map(toChatTool);
    const stream = await this.client.chat.completions.create({
      model: request.model ?? this.defaultModel,
      max_completion_tokens: request.maxTokens ?? this.defaultMaxTokens,
      stream: true,
      messages: [
        { role: 'system', content: request.system },
        ...request.messages.map(toChatMessage),
      ],
      ...(tools && tools.length > 0 ? { tools } : {}),
    });

    let finishReason: LlmFinishReason = 'stop';
    const toolCalls = new Map<number, ToolCallAccumulator>();

    for await (const chunk of stream) {
      const choice = chunk.choices[0];
      if (!choice) {
        continue;
      }
      const delta = choice.delta.content;
      if (delta) {
        yield { type: 'text-delta', text: delta };
      }
      for (const fragment of choice.delta.tool_calls ?? []) {
        const existing = toolCalls.get(fragment.index) ?? { id: '', name: '', args: '' };
        toolCalls.set(fragment.index, {
          id: fragment.id ?? existing.id,
          name: fragment.function?.name ?? existing.name,
          args: existing.args + (fragment.function?.arguments ?? ''),
        });
      }
      if (choice.finish_reason) {
        finishReason = mapFinishReason(choice.finish_reason);
      }
    }

    for (const call of toolCalls.values()) {
      yield { type: 'tool-call', id: call.id, name: call.name, input: parseArgs(call.args) };
    }

    yield { type: 'finish', finishReason };
  }

  async generateText(request: LlmCompletionRequest): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: request.model ?? this.defaultModel,
      max_completion_tokens: request.maxTokens ?? this.defaultMaxTokens,
      messages: [
        { role: 'system', content: request.system },
        ...request.messages.map(toChatMessage),
      ],
    });
    return response.choices[0]?.message.content ?? '';
  }
}

function toChatTool(spec: LlmToolSpec): ChatCompletionTool {
  return {
    type: 'function',
    function: {
      name: spec.name,
      description: spec.description,
      parameters: spec.parameters,
    },
  };
}

function toChatMessage(message: LlmMessage): ChatCompletionMessageParam {
  switch (message.role) {
    case 'user':
      return { role: 'user', content: message.content };
    case 'tool':
      return { role: 'tool', tool_call_id: message.toolCallId, content: message.content };
    case 'assistant':
      return {
        role: 'assistant',
        content: message.content,
        ...(message.toolCalls && message.toolCalls.length > 0
          ? {
              tool_calls: message.toolCalls.map((call) => ({
                id: call.id,
                type: 'function' as const,
                function: { name: call.name, arguments: JSON.stringify(call.input) },
              })),
            }
          : {}),
      };
  }
}

function parseArgs(raw: string): unknown {
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function mapFinishReason(
  reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'function_call',
): LlmFinishReason {
  switch (reason) {
    case 'length':
      return 'length';
    case 'tool_calls':
    case 'function_call':
      return 'tool';
    default:
      return 'stop';
  }
}
