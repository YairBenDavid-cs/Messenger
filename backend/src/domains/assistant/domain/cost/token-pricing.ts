// Per-model token pricing, expressed in USD per 1,000 tokens, split by prompt
// (input) vs completion (output) since providers charge them at different rates.
// Kept as data here (not in controllers, per the plan): a single source of truth
// the pure CostEstimator reads. Update these as the provider's published prices
// change; they are estimates for spend visibility, not billing.
export interface ModelPrice {
  // USD per 1,000 prompt (input) tokens.
  promptPer1k: number;
  // USD per 1,000 completion (output) tokens.
  completionPer1k: number;
}

export const TOKEN_PRICING: Readonly<Record<string, ModelPrice>> = {
  'gpt-4o': { promptPer1k: 0.005, completionPer1k: 0.015 },
  'gpt-4o-mini': { promptPer1k: 0.00015, completionPer1k: 0.0006 },
  'gpt-4': { promptPer1k: 0.03, completionPer1k: 0.06 },
};

// Fallback when a model id is not in the table: assume the most expensive known
// model so a forgotten entry over-reports rather than hides cost.
export const FALLBACK_MODEL_PRICE: ModelPrice = { promptPer1k: 0.03, completionPer1k: 0.06 };

export function priceForModel(model: string): ModelPrice {
  return TOKEN_PRICING[model] ?? FALLBACK_MODEL_PRICE;
}
