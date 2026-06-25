import { priceForModel } from './token-pricing';

// What one assistant request cost us, derived purely from token counts and the
// model's price. Tokens are estimates (we use the same char-based heuristic as the
// context budget, not provider-reported usage), so the dollar figure is a
// spend-visibility signal, not an invoice.
export interface CostEstimate {
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  usd: number;
}

// Pure mapping: (model, prompt tokens, completion tokens) -> dollars. No I/O, no
// clock — directly unit-testable.
export function estimateCost(
  model: string,
  promptTokens: number,
  completionTokens: number,
): CostEstimate {
  const price = priceForModel(model);
  const usd =
    (promptTokens / 1000) * price.promptPer1k +
    (completionTokens / 1000) * price.completionPer1k;
  return {
    model,
    promptTokens,
    completionTokens,
    totalTokens: promptTokens + completionTokens,
    // Round to 6 decimals: sub-cent requests still register, no float dust.
    usd: Math.round(usd * 1_000_000) / 1_000_000,
  };
}
