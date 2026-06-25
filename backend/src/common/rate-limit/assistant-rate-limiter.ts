import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenBucket } from './token-bucket';


@Injectable()
export class AssistantRateLimiter {
  private readonly buckets = new Map<string, TokenBucket>();
  private readonly capacity: number;
  private readonly refillPerSecond: number;

  constructor(config: ConfigService) {
    this.capacity = config.get<number>('ASSISTANT_RATE_BURST', 5);
    this.refillPerSecond = config.get<number>('ASSISTANT_RATE_REFILL_PER_SEC', 0.5);
  }

  tryConsume(userId: string, nowMs: number = Date.now()): boolean {
    let bucket = this.buckets.get(userId);
    if (bucket === undefined) {
      bucket = new TokenBucket(this.capacity, this.refillPerSecond, nowMs);
      this.buckets.set(userId, bucket);
    }
    return bucket.tryRemove(nowMs);
  }
}
