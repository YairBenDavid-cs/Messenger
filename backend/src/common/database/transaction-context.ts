import { AsyncLocalStorage } from 'node:async_hooks';
import type { ClientSession } from 'mongoose';

const storage = new AsyncLocalStorage<ClientSession>();

export const TransactionContext = {
  run<T>(session: ClientSession, work: () => Promise<T>): Promise<T> {
    return storage.run(session, work);
  },

  currentSession(): ClientSession | undefined {
    return storage.getStore();
  },
};
