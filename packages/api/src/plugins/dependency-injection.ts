import fp from 'fastify-plugin';
import type { DriverRegistry } from '../drivers/registry';
import type { Logger } from '../logging';
import { createLogger } from '../logging';
import type { ServiceRegistry } from '../services/registry';
import { createServiceRegistry } from '../services/registry';

declare module 'fastify' {
  /* eslint-disable-next-line @typescript-eslint/consistent-type-definitions */
  interface FastifyRequest<RouteGeneric, RawServer, RawRequest> {
    logger: Logger;
    service: ServiceRegistry;
  }
}

export type DependencyInjectionPluginOptions = {
  driver: DriverRegistry;
};

export const dependencyInjectionPlugin = fp<DependencyInjectionPluginOptions>(
  async (app, { driver }) => {
    app.decorateRequest('logger', null);
    app.decorateRequest('service', null);

    app.addHook('onRequest', async (request) => {
      const context = request.headers['x-cloud-trace-context'];
      const [id, parts] =
        typeof context === 'string' ? context.split('/') : [null, null];

      const span = parts?.slice(0, parts.indexOf(';')) ?? null;
      const trace =
        id != null && span != null
          ? {
              id,
              span,
            }
          : null;

      const logger = trace != null ? createLogger(trace) : createLogger();

      const service = createServiceRegistry({
        trace,
        driver,
      });

      request.logger = logger;
      request.service = service;
    });
  },
);
