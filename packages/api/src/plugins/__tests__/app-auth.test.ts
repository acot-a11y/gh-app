import type { FastifyInstance, FastifyRequest } from 'fastify';
import fastify from 'fastify';
import { output } from '../../services/utils';
import { createAppServiceMock } from '../../services/__mocks__/app';
import { createServiceRegistryMock } from '../../services/__mocks__/registry';
import { createLoggerMock } from '../../__mocks__/logging';
import { appAuthPlugin } from '../app-auth';

describe('appAuthPlugin', () => {
  let server: FastifyInstance;

  beforeEach(async () => {
    server = fastify().register(appAuthPlugin);

    await server.after();
  });

  test('without authorization header', async () => {
    const handler = jest.fn();
    server.get('/', handler);

    const res = await server.inject({
      method: 'GET',
      url: '/',
    });

    expect(res.statusCode).toBe(401);

    expect(handler).not.toBeCalled();
  });

  test('invalid token type', async () => {
    const handler = jest.fn();
    server.get('/', handler);

    const res = await server.inject({
      method: 'GET',
      url: '/',
      headers: {
        Authorization: 'Foo token',
      },
    });

    expect(res.statusCode).toBe(400);

    expect(handler).not.toBeCalled();
  });

  test('invalid token', async () => {
    const handler = jest.fn();
    server.get('/', handler);

    const service = createServiceRegistryMock().provideValue(
      'app',
      createAppServiceMock({
        verifyToken: jest.fn().mockResolvedValueOnce(output(false, 'message')),
      }),
    );

    server.decorateRequest('service', {
      getter: () => service,
    });

    const logger = createLoggerMock();

    server.decorateRequest('logger', {
      getter: () => logger,
    });

    const res = await server.inject({
      method: 'GET',
      url: '/',
      headers: {
        Authorization: 'Bearer token',
      },
    });

    expect(res.statusCode).toBe(401);

    expect(service.resolve('app').verifyToken).toBeCalledWith({
      token: 'token',
    });

    expect(logger.warn).toBeCalledWith('message', 'failed app-auth');

    expect(handler).not.toBeCalled();
  });

  test('valid token', async () => {
    let app: FastifyRequest['app'];
    server.get('/', (request, reply) => {
      app = request.app;
      reply.send();
    });

    const service = createServiceRegistryMock().provideValue(
      'app',
      createAppServiceMock({
        verifyToken: jest.fn().mockResolvedValueOnce(
          output(true, {
            installation_id: 12345,
            owner: 'owner',
            repo: 'repo',
          }),
        ),
      }),
    );

    server.decorateRequest('service', {
      getter: () => service,
    });

    const res = await server.inject({
      method: 'GET',
      url: '/',
      headers: {
        Authorization: 'Bearer token',
      },
    });

    expect(res.statusCode).toBe(200);

    expect(service.resolve('app').verifyToken).toBeCalledWith({
      token: 'token',
    });

    expect(app!).toEqual({
      installation_id: 12345,
      owner: 'owner',
      repo: 'repo',
    });
  });

  test('unexpected error', async () => {
    const handler = jest.fn();
    server.get('/', handler);

    const e = new Error('test');
    const service = createServiceRegistryMock().provideValue(
      'app',
      createAppServiceMock({
        verifyToken: jest.fn().mockRejectedValueOnce(e),
      }),
    );

    server.decorateRequest('service', {
      getter: () => service,
    });

    const logger = createLoggerMock();

    server.decorateRequest('logger', {
      getter: () => logger,
    });

    const res = await server.inject({
      method: 'GET',
      url: '/',
      headers: {
        Authorization: 'Bearer token',
      },
    });

    expect(res.statusCode).toBe(500);

    expect(logger.error).toBeCalledWith(
      e,
      expect.stringContaining('AppService.verifyToken'),
    );

    expect(handler).not.toBeCalled();
  });
});
