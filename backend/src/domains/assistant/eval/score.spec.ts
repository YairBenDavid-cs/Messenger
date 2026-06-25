import { scoreOutcome, suiteAverage } from './score';
import { checksSchema, evalCaseSchema, type AssistantOutcome } from './eval.types';

function outcome(text: string, toolsInvoked: string[] = []): AssistantOutcome {
  return { text, toolsInvoked };
}

describe('scoreOutcome', () => {
  it('scores 1 when a case asserts nothing', () => {
    expect(scoreOutcome({}, outcome('anything')).score).toBe(1);
  });

  it('matches containsAll case-insensitively', () => {
    const result = scoreOutcome({ containsAll: ['Hello', 'WORLD'] }, outcome('hello world'));
    expect(result.score).toBe(1);
    expect(result.results.every((r) => r.passed)).toBe(true);
  });

  it('gives partial credit when only some checks pass', () => {
    expect(scoreOutcome({ containsAll: ['present', 'absent'] }, outcome('present')).score).toBe(0.5);
  });

  it('passes containsAny when at least one phrase appears', () => {
    expect(scoreOutcome({ containsAny: ['a', 'b'] }, outcome('only b here')).score).toBe(1);
    expect(scoreOutcome({ containsAny: ['x', 'y'] }, outcome('neither')).score).toBe(0);
  });

  it('fails notContains when a forbidden phrase leaks', () => {
    const result = scoreOutcome({ notContains: ['other-user-secret'] }, outcome('here is OTHER-USER-SECRET'));
    expect(result.score).toBe(0);
  });

  it('checks tool invocation and the no-tools assertion', () => {
    expect(scoreOutcome({ toolsInvoked: ['search_my_messages'] }, outcome('', ['search_my_messages'])).score).toBe(1);
    expect(scoreOutcome({ toolsInvoked: ['search_my_messages'] }, outcome('', [])).score).toBe(0);
    expect(scoreOutcome({ noTools: true }, outcome('plain answer', [])).score).toBe(1);
    expect(scoreOutcome({ noTools: true }, outcome('answer', ['search_my_messages'])).score).toBe(0);
  });

  it('checks length bounds and regex', () => {
    expect(scoreOutcome({ minLength: 5 }, outcome('hi')).score).toBe(0);
    expect(scoreOutcome({ maxLength: 3 }, outcome('hello')).score).toBe(0);
    expect(scoreOutcome({ regex: '^\\d{4}$' }, outcome('2026')).score).toBe(1);
  });
});

describe('suiteAverage', () => {
  it('averages case scores', () => {
    expect(suiteAverage([{ score: 1, results: [] }, { score: 0, results: [] }])).toBe(0.5);
  });

  it('is zero for an empty suite', () => {
    expect(suiteAverage([])).toBe(0);
  });
});

describe('eval case schema', () => {
  it('accepts a well-formed case', () => {
    expect(
      evalCaseSchema.safeParse({ id: 'c1', input: 'hi', checks: { noTools: true } }).success,
    ).toBe(true);
  });

  it('rejects unknown check keys (fail closed on typos)', () => {
    expect(checksSchema.safeParse({ contains: ['x'] }).success).toBe(false);
  });

  it('rejects a case with an empty input', () => {
    expect(evalCaseSchema.safeParse({ id: 'c1', input: '', checks: {} }).success).toBe(false);
  });
});
