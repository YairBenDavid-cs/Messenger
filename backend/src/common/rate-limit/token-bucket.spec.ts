import { TokenBucket } from './token-bucket';

describe('TokenBucket', () => {
  it('starts full and allows a burst up to capacity', () => {
    const bucket = new TokenBucket(3, 1, 0);
    expect(bucket.tryRemove(0)).toBe(true);
    expect(bucket.tryRemove(0)).toBe(true);
    expect(bucket.tryRemove(0)).toBe(true);
    expect(bucket.tryRemove(0)).toBe(false);
  });

  it('refills continuously at the configured rate', () => {
    const bucket = new TokenBucket(2, 1, 0); 
    expect(bucket.tryRemove(0)).toBe(true);
    expect(bucket.tryRemove(0)).toBe(true);
    expect(bucket.tryRemove(0)).toBe(false);
    expect(bucket.tryRemove(1000)).toBe(true);
    expect(bucket.tryRemove(1000)).toBe(false);
  });

  it('never refills beyond capacity', () => {
    const bucket = new TokenBucket(2, 10, 0);
    expect(bucket.available(10_000)).toBe(2);
    expect(bucket.tryRemove(10_000)).toBe(true);
    expect(bucket.tryRemove(10_000)).toBe(true);
    expect(bucket.tryRemove(10_000)).toBe(false);
  });

  it('supports sub-token-per-second refill rates', () => {
    const bucket = new TokenBucket(1, 0.5, 0); 
    expect(bucket.tryRemove(0)).toBe(true);
    expect(bucket.tryRemove(0)).toBe(false);
    expect(bucket.tryRemove(1000)).toBe(false); 
    expect(bucket.tryRemove(2000)).toBe(true); 
  });

  it('ignores non-monotonic (backwards) clock readings', () => {
    const bucket = new TokenBucket(1, 1, 1000);
    expect(bucket.tryRemove(1000)).toBe(true);
    expect(bucket.available(500)).toBe(0);
  });
});
