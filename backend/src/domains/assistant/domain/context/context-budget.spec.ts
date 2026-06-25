import { AssistantChatMessage, type AssistantChatMessageRole } from '../assistant-chat-message.entity';
import { DEFAULT_CONTEXT_BUDGET, historyBudget, planRollUp } from './context-budget';
import { estimateMessageTokens } from './token-estimate';

function turn(role: AssistantChatMessageRole, text: string): AssistantChatMessage {
  return new AssistantChatMessage({ id: role + text, conversationId: 'c', role, text, createdAt: new Date(0) });
}

// Builds `pairs` alternating user/assistant turns of identical token cost, so the
// fold math is exact and independent of the tokenizer.
const TEXT = 'a representative conversation message of some length';
function equalCostTurns(pairs: number): AssistantChatMessage[] {
  const turns: AssistantChatMessage[] = [];
  for (let i = 0; i < pairs * 2; i++) {
    turns.push(turn(i % 2 === 0 ? 'user' : 'assistant', TEXT));
  }
  return turns;
}

describe('historyBudget', () => {
  it('deducts every fixed reservation from the total', () => {
    const b = DEFAULT_CONTEXT_BUDGET;
    const expected =
      b.total -
      b.reservedForOutput -
      b.reservedForUserInput -
      b.reservedForSystem -
      b.reservedForTools -
      b.safetyBuffer;
    expect(historyBudget(b, 0)).toBe(expected);
  });

  it('also deducts the live running-summary cost', () => {
    expect(historyBudget(DEFAULT_CONTEXT_BUDGET, 0) - historyBudget(DEFAULT_CONTEXT_BUDGET, 1500)).toBe(1500);
  });

  it('never goes negative', () => {
    expect(historyBudget(DEFAULT_CONTEXT_BUDGET, 10_000_000)).toBe(0);
  });
});

describe('planRollUp', () => {
  const c = estimateMessageTokens(TEXT);

  it('does not compact when the active history fits the budget', () => {
    const turns = equalCostTurns(5);
    expect(planRollUp(turns, 0, 1_000_000)).toBeNull();
  });

  it('folds ~70% of the active token volume on a pair boundary when overflowing', () => {
    const turns = equalCostTurns(10); // 20 messages, total 20c
    // Tiny budget forces overflow. 70% of 20 messages = 14, which lands inside the
    // 65–75% band and ends on an assistant turn.
    const plan = planRollUp(turns, 0, c);
    expect(plan).toEqual({ foldUpTo: 14 });
  });

  it('cuts on a complete pair: folded segment ends on assistant, tail begins on user', () => {
    const turns = equalCostTurns(10);
    const plan = planRollUp(turns, 0, c);
    const foldUpTo = plan?.foldUpTo ?? -1;
    expect(turns[foldUpTo - 1].role).toBe('assistant');
    expect(turns[foldUpTo].role).toBe('user');
  });

  it('always leaves a raw tail behind', () => {
    const turns = equalCostTurns(10);
    const plan = planRollUp(turns, 0, c);
    expect(plan?.foldUpTo).toBeLessThan(turns.length);
  });

  it('measures the active window from the summarized cursor', () => {
    const turns = equalCostTurns(10); // 20 messages; cursor skips the first 2 pairs
    // active = 16 messages (total 16c); the nearest in-band pair boundary to 70% is 12,
    // so the absolute fold index is 4 + 12 = 16.
    const plan = planRollUp(turns, 4, c);
    expect(plan).toEqual({ foldUpTo: 16 });
  });

  it('never folds the only pair (nothing left to keep raw)', () => {
    const turns = equalCostTurns(1);
    expect(planRollUp(turns, 0, 0)).toBeNull();
  });
});
