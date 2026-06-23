import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { MongoUnitOfWork } from './mongo-unit-of-work';
import type { UnitOfWork } from './unit-of-work';

@Injectable()
export class TransactionRunner {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async run<T>(work: (uow: UnitOfWork) => Promise<T>): Promise<T> {
    const session = await this.connection.startSession();
    try {
      let result: T;
      await session.withTransaction(async () => {
        result = await work(new MongoUnitOfWork(session));
      });
      return result!;
    } finally {
      await session.endSession();
    }
  }
}
