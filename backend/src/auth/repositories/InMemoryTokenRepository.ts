import type { ITokenRepository } from './ITokenRepository';

export class InMemoryTokenRepository implements ITokenRepository {
  private readonly tokens = new Map<string, string>();

  async save(token: string, userId: string): Promise<void> {
    this.tokens.set(token, userId);
  }

  async getUserId(token: string): Promise<string | null> {
    return this.tokens.get(token) ?? null;
  }
}
