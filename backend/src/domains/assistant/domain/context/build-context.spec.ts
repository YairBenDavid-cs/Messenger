import { AssistantChatMessage, type AssistantChatMessageRole } from '../assistant-chat-message.entity';
import { buildContext } from './build-context';
import { type ContextBudget } from './context-budget';
import { estimateMessageTokens, estimateTokens } from './token-estimate';

function turn(role: AssistantChatMessageRole, text: string): AssistantChatMessage {
  return new AssistantChatMessage({ id: role + text, conversationId: 'c', role, text, createdAt: new Date(0) });
}

function historyOnly(total: number): ContextBudget {
  return {
    total,
    reservedForOutput: 0,
    reservedForUserInput: 0,
    reservedForSystem: 0,
    reservedForTools: 0,
    safetyBuffer: 0,
  };
}

const HUGE = historyOnly(1_000_000);

describe('estimateTokens', () => {
  it('is zero for empty text', () => {
    expect(estimateTokens('')).toBe(0);
  });

  it('returns a positive count for non-empty text and grows with length', () => {
    expect(estimateTokens('hello')).toBeGreaterThan(0);
    expect(estimateTokens('hello world, this is a longer sentence')).toBeGreaterThan(
      estimateTokens('hello'),
    );
  });

  it('adds a fixed per-message overhead', () => {
    expect(estimateMessageTokens('abcd')).toBe(estimateTokens('abcd') + 4);
  });
});

describe('buildContext', () => {
  it('returns nothing when every turn is already summarized', () => {
    const turns = [turn('user', 'a'), turn('assistant', 'b')];
    expect(buildContext({ summary: 's', summarizedUpTo: 2, turns, budget: HUGE })).toEqual([]);
  });

  it('skips summarized head turns and preserves chronological order', () => {
    const turns = [
      turn('user', 'q1'),
      turn('assistant', 'a1'),
      turn('user', 'q2'),
      turn('assistant', 'a2'),
    ];
    expect(buildContext({ summary: 'prev', summarizedUpTo: 2, turns, budget: HUGE })).toEqual([
      { role: 'user', content: 'q2' },
      { role: 'assistant', content: 'a2' },
    ]);
  });

  it('always keeps the latest turn even if it alone exceeds the budget', () => {
    const turns = [turn('user', 'aaaaaaaaaa'), turn('assistant', 'bbbbbbbbbb')];
    expect(buildContext({ summary: '', summarizedUpTo: 0, turns, budget: historyOnly(1) })).toEqual([
      { role: 'assistant', content: 'bbbbbbbbbb' },
    ]);
  });

  it('walks newest->oldest, dropping older turns that overflow the budget', () => {
    const text = 'xxxx';
    const turns = [turn('user', text), turn('assistant', text), turn('user', text)];
    // Budget sized for exactly two messages: the oldest turn must be dropped.
    const budget = historyOnly(estimateMessageTokens(text) * 2);
    expect(buildContext({ summary: '', summarizedUpTo: 0, turns, budget })).toEqual([
      { role: 'assistant', content: text },
      { role: 'user', content: text },
    ]);
  });

  it('charges the summary against the available history budget', () => {
    const text = 'xxxx';
    const turns = [turn('user', text), turn('assistant', text), turn('user', text)];
    const summary = 'this summary costs some tokens against the history budget';
    // Same two-message budget, but the summary eats into it, so fewer turns survive.
    const budget = historyOnly(estimateMessageTokens(text) * 2 + estimateTokens(summary));
    const withSummary = buildContext({ summary, summarizedUpTo: 0, turns, budget });
    expect(withSummary.length).toBeLessThan(3);
    expect(withSummary[withSummary.length - 1]).toEqual({ role: 'user', content: text });
  });

  it('does not mutate its input array', () => {
    const turns = [turn('user', 'q1'), turn('assistant', 'a1')];
    const snapshot = JSON.stringify(turns);
    buildContext({ summary: '', summarizedUpTo: 0, turns, budget: HUGE });
    expect(JSON.stringify(turns)).toBe(snapshot);
  });

  it('carries a long conversation forward as raw tail + summary (earlier context survives)', () => {
    const turns: AssistantChatMessage[] = [];
    for (let i = 0; i < 40; i++) {
      turns.push(turn(i % 2 === 0 ? 'user' : 'assistant', `message number ${i}`));
    }
    const ctx = buildContext({
      summary: 'EARLIER: user asked about topic X and the assistant explained Y.',
      summarizedUpTo: 34,
      turns,
      budget: HUGE,
    });
    expect(ctx).toHaveLength(6);
    expect(ctx[0]).toEqual({ role: 'user', content: 'message number 34' });
    expect(ctx[ctx.length - 1]).toEqual({ role: 'assistant', content: 'message number 39' });
    expect(ctx.some((m) => m.content.startsWith('EARLIER'))).toBe(false);
  });
});
