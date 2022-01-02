import { createInjector } from 'typed-inject';
import type { DriverRegistry } from '../drivers/registry';
import type { TraceContext } from '../logging';
import { createLogger } from '../logging';
import { createAppService } from './app';
import { createAuthService } from './auth';
import { createNotifyService } from './notify';

export type CreateServiceOptions = {
  trace: TraceContext | null;
  driver: DriverRegistry;
};

export const createServiceRegistry = ({
  trace,
  driver,
}: CreateServiceOptions) =>
  createInjector()
    .provideValue('trace', trace)
    .provideValue('driver', driver)
    .provideFactory('logger', createLogger)
    .provideFactory('app', createAppService)
    .provideFactory('auth', createAuthService)
    .provideFactory('notify', createNotifyService);

export type ServiceRegistry = ReturnType<typeof createServiceRegistry>;
