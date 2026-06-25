import { encode } from 'gpt-tokenizer/cjs/encoding/o200k_base';

const PER_MESSAGE_OVERHEAD_TOKENS = 4;

export function estimateTokens(text: string): number {
  if (text.length === 0) {
    return 0;
  }
  return encode(text).length;
}

export function estimateMessageTokens(text: string): number {
  return estimateTokens(text) + PER_MESSAGE_OVERHEAD_TOKENS;
}
