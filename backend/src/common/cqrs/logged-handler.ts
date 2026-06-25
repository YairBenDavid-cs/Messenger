import { Logger } from '@nestjs/common';

export abstract class LoggedHandler<TInput extends object, TResult> {

  private readonly logger = new Logger(this.constructor.name);

  async execute(input: TInput): Promise<TResult> {
    const name = input.constructor.name;
    const startedAt = Date.now();
    try {
      const result = await this.handle(input);
      this.logger.log(`${name} ok ${Date.now() - startedAt}ms`);
      return result;
    } catch (error) {
      this.logger.warn(`${name} failed ${Date.now() - startedAt}ms`);
      throw error;
    }
  }

  protected abstract handle(input: TInput): Promise<TResult>;
}
