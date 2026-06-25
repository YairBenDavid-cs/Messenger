import { Inject, Injectable } from '@nestjs/common';
import type { LlmToolSpec } from '../domain/llm-provider';
import { ASSISTANT_TOOLS, type AssistantTool } from './assistant-tool';

@Injectable()
export class AssistantToolRegistry {
  private readonly byName: Map<string, AssistantTool>;

  constructor(@Inject(ASSISTANT_TOOLS) tools: AssistantTool[]) {
    this.byName = new Map(tools.map((tool) => [tool.spec.name, tool]));
  }

  specs(): LlmToolSpec[] {
    return [...this.byName.values()].map((tool) => tool.spec);
  }

  async run(name: string, rawInput: unknown, userId: string): Promise<string> {
    const tool = this.byName.get(name);
    if (!tool) {
      return JSON.stringify({ error: `unknown tool: ${name}` });
    }
    try {
      return await tool.run(rawInput, userId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'tool execution failed';
      return JSON.stringify({ error: message });
    }
  }
}
