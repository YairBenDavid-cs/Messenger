import { ConfigService } from '@nestjs/config';
import { AssistantRateLimiter } from './assistant-rate-limiter';

function limiter(): AssistantRateLimiter {
  return new AssistantRateLimiter(
    new ConfigService({ ASSISTANT_RATE_BURST: 2, ASSISTANT_RATE_REFILL_PER_SEC: 0 }),
  );
}

describe('AssistantRateLimiter', () => {
  it('allows up to the burst capacity then denies', () => {
    const rl = limiter();
    expect(rl.tryConsume('user-a', 0)).toBe(true);
    expect(rl.tryConsume('user-a', 0)).toBe(true);
    expect(rl.tryConsume('user-a', 0)).toBe(false);
  });

  it('tracks each user independently', () => {
    const rl = limiter();
    expect(rl.tryConsume('user-a', 0)).toBe(true);
    expect(rl.tryConsume('user-a', 0)).toBe(true);
    expect(rl.tryConsume('user-a', 0)).toBe(false);
    expect(rl.tryConsume('user-b', 0)).toBe(true);
    expect(rl.tryConsume('user-b', 0)).toBe(true);
    expect(rl.tryConsume('user-b', 0)).toBe(false);
  });
});
