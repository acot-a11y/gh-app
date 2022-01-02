import { createInjector } from 'typed-inject';
import type { DriverRegistry } from '../registry';
import { createCryptoClientMock } from './crypto';
import { createDatastoreClientMock } from './datastore';
import { createGhClientMock } from './github';

export const createDriverRegistryMock = (): DriverRegistry =>
  createInjector()
    .provideFactory('crypto', createCryptoClientMock)
    .provideFactory('datastore', createDatastoreClientMock)
    .provideFactory('github', createGhClientMock);
