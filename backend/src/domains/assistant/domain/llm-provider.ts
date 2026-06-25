
export const LLM_PROVIDER = Symbol('LLM_PROVIDER');

export type LlmRole = 'user' | 'assistant';

export interface LlmToolSpec {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface LlmToolCall {
  id: string;
  name: string;
  input: unknown;
}

export type LlmMessage =
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string; toolCalls?: LlmToolCall[] | undefined }
  | { role: 'tool'; toolCallId: string; content: string };

export type LlmFinishReason = 'stop' | 'length' | 'tool';

export type LlmStreamEvent =
  | { type: 'text-delta'; text: string }
  | { type: 'tool-call'; id: string; name: string; input: unknown }
  | { type: 'finish'; finishReason: LlmFinishReason };

export interface LlmCompletionRequest {
  system: string;
  messages: LlmMessage[];
  tools?: LlmToolSpec[] | undefined;
  model?: string;
  maxTokens?: number;
}

export interface LlmProvider {
  stream(request: LlmCompletionRequest): AsyncIterable<LlmStreamEvent>;

  generateText(request: LlmCompletionRequest): Promise<string>;
}
