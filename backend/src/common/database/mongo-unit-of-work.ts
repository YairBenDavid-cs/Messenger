import type { ClientSession } from 'mongoose';
import type { UnitOfWork } from './unit-of-work';

export class MongoUnitOfWork implements UnitOfWork {
  readonly isUnitOfWork = true as const;

  constructor(readonly session: ClientSession) {}
}

export function sessionOf(uow: UnitOfWork | undefined): ClientSession | undefined {
  return uow instanceof MongoUnitOfWork ? uow.session : undefined;
}
