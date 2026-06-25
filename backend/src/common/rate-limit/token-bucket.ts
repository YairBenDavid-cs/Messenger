// A pure token-bucket rate limiter (no clock, no I/O, no framework). The caller
// supplies the current time, so behaviour is fully deterministic and unit-testable.
//
// The bucket holds at most `capacity` tokens and refills continuously at
// `refillPerSecond`. Each accepted request removes one token; a request is denied
// when the bucket is empty. Allowing the bucket to start full gives a burst
// allowance equal to its capacity, then steady-state throughput equal to the
// refill rate.
export class TokenBucket {
  private tokens: number;
  private lastRefillMs: number;

  constructor(
    private readonly capacity: number,
    private readonly refillPerSecond: number,
    nowMs: number,
  ) {
    this.tokens = capacity;
    this.lastRefillMs = nowMs;
  }

  // Attempt to spend one token at time `nowMs`. Refills for the elapsed time
  // first, then consumes if a whole token is available. Returns whether the
  // request is allowed.
  tryRemove(nowMs: number): boolean {
    this.refill(nowMs);
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }

  // Current token count, refilled to `nowMs`. Exposed for observability/testing.
  available(nowMs: number): number {
    this.refill(nowMs);
    return this.tokens;
  }

  private refill(nowMs: number): void {
    if (nowMs <= this.lastRefillMs) {
      return;
    }
    const elapsedSeconds = (nowMs - this.lastRefillMs) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsedSeconds * this.refillPerSecond);
    this.lastRefillMs = nowMs;
  }
}
