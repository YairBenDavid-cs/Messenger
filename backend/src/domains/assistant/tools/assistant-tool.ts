import type { LlmToolSpec } from '../domain/llm-provider';

export const ASSISTANT_TOOLS = Symbol('ASSISTANT_TOOLS');

export interface AssistantTool {
  readonly spec: LlmToolSpec;
  run(rawInput: unknown, userId: string): Promise<string>;
}
