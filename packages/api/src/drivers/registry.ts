import { createInjector } from 'typed-inject';
import { createCryptoClient } from './crypto';
import { createDatastoreClient } from './datastore';
import { createGhClient } from './github';

export const createDriverRegistry = () =>
  createInjector()
    .provideFactory('crypto', createCryptoClient)
    .provideFactory('datastore', createDatastoreClient)
    .provideFactory('github', createGhClient);

export type DriverRegistry = ReturnType<typeof createDriverRegistry>;
