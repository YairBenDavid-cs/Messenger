import {
  type LlmFinishReason,
  type LlmMessage,
  type LlmProvider,
  type LlmToolCall,
} from '../domain/llm-provider';
import { PromptRepository } from '../prompts/prompt.repository';
import { AssistantToolRegistry } from '../tools/assistant-tool.registry';
import type { AssistantOutcome } from './eval.types';

const MAX_ITERATIONS = 3;

export interface RunDeps {
  provider: LlmProvider;
  prompts: PromptRepository;
  tools: AssistantToolRegistry;
  userId: string;
}
export async function runAssistant(deps: RunDeps, input: string): Promise<AssistantOutcome> {
  const { provider, prompts, tools, userId } = deps;
  const system = prompts.getSystemPrompt();
  const toolSpecs = tools.specs();
  const messages: LlmMessage[] = [{ role: 'user', content: input }];
  const toolsInvoked: string[] = [];
  let buffer = '';

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    const isLastPass = iteration === MAX_ITERATIONS - 1;
    const toolCalls: LlmToolCall[] = [];
    let roundText = '';
    let finish: LlmFinishReason = 'stop';

    for await (const event of provider.stream({
      system,
      messages,
      tools: isLastPass ? undefined : toolSpecs,
    })) {
      if (event.type === 'text-delta') {
        buffer += event.text;
        roundText += event.text;
      } else if (event.type === 'tool-call') {
        toolCalls.push({ id: event.id, name: event.name, input: event.input });
      } else if (event.type === 'finish') {
        finish = event.finishReason;
      }
    }

    if (toolCalls.length === 0) {
      break;
    }
    void finish;

    messages.push({ role: 'assistant', content: roundText, toolCalls });
    for (const call of toolCalls) {
      toolsInvoked.push(call.name);
      const result = await tools.run(call.name, call.input, userId);
      messages.push({ role: 'tool', toolCallId: call.id, content: result });
    }
  }

  return { text: buffer, toolsInvoked };
}
