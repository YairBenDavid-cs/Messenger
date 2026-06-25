import { estimateCost } from './cost-estimator';
import { FALLBACK_MODEL_PRICE, TOKEN_PRICING } from './token-pricing';

describe('estimateCost', () => {
  it('prices prompt and completion tokens separately from the model table', () => {
    const price = TOKEN_PRICING['gpt-4o'];
    if (price === undefined) {
      throw new Error('expected gpt-4o pricing');
    }
    const result = estimateCost('gpt-4o', 1000, 1000);
    expect(result.promptTokens).toBe(1000);
    expect(result.completionTokens).toBe(1000);
    expect(result.totalTokens).toBe(2000);
    // 1k prompt * promptPer1k + 1k completion * completionPer1k.
    expect(result.usd).toBeCloseTo(price.promptPer1k + price.completionPer1k, 9);
  });

  it('reports zero cost for an empty request', () => {
    expect(estimateCost('gpt-4o-mini', 0, 0).usd).toBe(0);
  });

  it('falls back to the most expensive price for an unknown model', () => {
    const result = estimateCost('some-future-model', 2000, 0);
    expect(result.usd).toBeCloseTo((2000 / 1000) * FALLBACK_MODEL_PRICE.promptPer1k, 9);
  });

  it('rounds to six decimals so sub-cent requests still register', () => {
    const result = estimateCost('gpt-4o-mini', 1, 1);
    expect(result.usd).toBeGreaterThan(0);
    // No float dust beyond 6 decimals.
    expect(result.usd).toBe(Math.round(result.usd * 1_000_000) / 1_000_000);
  });
});
