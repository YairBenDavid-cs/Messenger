import type { AssistantOutcome, CaseScore, CheckResult, Checks } from './eval.types';

export function scoreOutcome(checks: Checks, outcome: AssistantOutcome): CaseScore {
  const haystack = outcome.text.toLowerCase();
  const results: CheckResult[] = [];

  for (const needle of checks.containsAll ?? []) {
    results.push({ label: `contains "${needle}"`, passed: haystack.includes(needle.toLowerCase()) });
  }

  if (checks.containsAny !== undefined) {
    const passed = checks.containsAny.some((needle) => haystack.includes(needle.toLowerCase()));
    results.push({ label: `contains any of [${checks.containsAny.join(', ')}]`, passed });
  }

  for (const needle of checks.notContains ?? []) {
    results.push({
      label: `does not contain "${needle}"`,
      passed: !haystack.includes(needle.toLowerCase()),
    });
  }

  if (checks.regex !== undefined) {
    results.push({
      label: `matches /${checks.regex}/i`,
      passed: new RegExp(checks.regex, 'i').test(outcome.text),
    });
  }

  if (checks.minLength !== undefined) {
    results.push({
      label: `length >= ${checks.minLength}`,
      passed: outcome.text.trim().length >= checks.minLength,
    });
  }

  if (checks.maxLength !== undefined) {
    results.push({
      label: `length <= ${checks.maxLength}`,
      passed: outcome.text.trim().length <= checks.maxLength,
    });
  }

  for (const tool of checks.toolsInvoked ?? []) {
    results.push({ label: `invoked tool "${tool}"`, passed: outcome.toolsInvoked.includes(tool) });
  }

  if (checks.noTools === true) {
    results.push({ label: 'invoked no tools', passed: outcome.toolsInvoked.length === 0 });
  }

  if (results.length === 0) {
    return { score: 1, results };
  }
  const passed = results.filter((result) => result.passed).length;
  return { score: passed / results.length, results };
}

export function suiteAverage(scores: CaseScore[]): number {
  if (scores.length === 0) {
    return 0;
  }
  return scores.reduce((sum, score) => sum + score.score, 0) / scores.length;
}
