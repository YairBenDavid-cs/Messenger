import type { AssistantChatMessage } from '../assistant-chat-message.entity';
import type { LlmMessage } from '../llm-provider';
import { historyBudget, type ContextBudget } from './context-budget';
import { estimateMessageTokens, estimateTokens } from './token-estimate';

export interface BuildContextInput {
  summary: string;
  summarizedUpTo: number;
  turns: AssistantChatMessage[];
  budget: ContextBudget;
}
export function buildContext(input: BuildContextInput): LlmMessage[] {
  const { summary, summarizedUpTo, turns, budget } = input;

  const raw = turns.slice(Math.max(0, summarizedUpTo));
  if (raw.length === 0) {
    return [];
  }

  const available = historyBudget(budget, estimateTokens(summary));
  const kept: AssistantChatMessage[] = [];
  let used = 0;

  for (let i = raw.length - 1; i >= 0; i--) {
    const turn = raw[i];
    const cost = estimateMessageTokens(turn.text);
    if (kept.length > 0 && used + cost > available) {
      break;
    }
    kept.push(turn);
    used += cost;
  }

  kept.reverse();
  return kept.map(toLlmMessage);
}

function toLlmMessage(turn: AssistantChatMessage): LlmMessage {
  return turn.role === 'assistant'
    ? { role: 'assistant', content: turn.text }
    : { role: 'user', content: turn.text };
}
