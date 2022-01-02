import type { FastifyInstance } from 'fastify';
import fastify from 'fastify';
import type { DriverRegistry } from '../../drivers/registry';
import { createDriverRegistryMock } from '../../drivers/__mocks__/registry';
import type { Logger } from '../../logging';
import type { ServiceRegistry } from '../../services/registry';
import { createServiceRegistry } from '../../services/registry';
import { dependencyInjectionPlugin } from '../dependency-injection';

describe('dependencyInjectionPlugin', () => {
  let server: FastifyInstance;
  let driver: DriverRegistry;

  beforeEach(async () => {
    driver = createDriverRegistryMock();

    server = fastify().register(dependencyInjectionPlugin, {
      driver,
    });

    await server.after();
  });

  test('without trace', async () => {
    let logger: Logger;
    let service: ServiceRegistry;
    server.get('/', (request, reply) => {
      logger = request.logger;
      service = request.service;
      reply.send();
    });

    await server.inject({
      method: 'GET',
      url: '/',
    });

    expect(typeof logger!.info).toBe('function');

    expect(service!).toEqual(
      createServiceRegistry({
        trace: null,
        driver,
      }),
    );
  });

  test('with trace', async () => {
    let logger: Logger;
    let service: ServiceRegistry;
    server.get('/', (request, reply) => {
      logger = request.logger;
      service = request.service;
      reply.send();
    });

    await server.inject({
      method: 'GET',
      url: '/',
      headers: {
        'X-Cloud-Trace-Context': 'TRACE_ID/SPAN_ID;o=TRACE_TRUE',
      },
    });

    expect(typeof logger!.info).toBe('function');

    expect(service!).toEqual(
      createServiceRegistry({
        trace: {
          id: 'TRACE_ID',
          span: 'SPAN_ID',
        },
        driver,
      }),
    );
  });
});
