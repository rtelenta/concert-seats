import { AsyncLocalStorage } from 'async_hooks';

const storage = new AsyncLocalStorage<string>();

export const CorrelationIdStorage = {
  run<T>(id: string, fn: () => T): T {
    return storage.run(id, fn);
  },
  get(): string | undefined {
    return storage.getStore();
  },
};
