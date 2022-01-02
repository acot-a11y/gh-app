import { createInjector } from 'typed-inject';
import { createDriverRegistryMock } from '../../drivers/__mocks__/registry';
import { createLoggerMock } from '../../__mocks__/logging';
import type { ServiceRegistry } from '../registry';
import { createAppServiceMock } from './app';
import { createAuthServiceMock } from './auth';
import { createNotifyServiceMock } from './notify';

export const createServiceRegistryMock = (): ServiceRegistry =>
  createInjector()
    .provideValue('trace', null)
    .provideValue('driver', createDriverRegistryMock())
    .provideFactory('logger', createLoggerMock)
    .provideFactory('app', createAppServiceMock)
    .provideFactory('auth', createAuthServiceMock)
    .provideFactory('notify', createNotifyServiceMock);
