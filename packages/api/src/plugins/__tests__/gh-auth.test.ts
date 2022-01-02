import type { FastifyInstance, FastifyRequest } from 'fastify';
import fastify from 'fastify';
import type { DriverRegistry } from '../../drivers/registry';
import { createGhClientMock } from '../../drivers/__mocks__/github';
import { createDriverRegistryMock } from '../../drivers/__mocks__/registry';
import { createLoggerMock } from '../../__mocks__/logging';
import { ghAuthPlugin } from '../gh-auth';

describe('ghAuthPlugin', () => {
  const setup = async (driver: DriverRegistry): Promise<FastifyInstance> => {
    const server = fastify();

    server.register(ghAuthPlugin, {
      driver,
    });

    await server.after();

    return server;
  };

  test('without authorization header', async () => {
    const server = await setup(createDriverRegistryMock());

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
    const server = await setup(createDriverRegistryMock());

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
    const e = new Error('test');
    const driver = createDriverRegistryMock().provideValue(
      'github',
      createGhClientMock({
        getAuthenticatedUser: jest.fn().mockRejectedValueOnce(e),
      }),
    );

    const server = await setup(driver);

    const logger = createLoggerMock();

    server.decorateRequest('logger', {
      getter: () => logger,
    });

    const handler = jest.fn();
    server.get('/', handler);

    const res = await server.inject({
      method: 'GET',
      url: '/',
      headers: {
        Authorization: 'github token',
      },
    });

    expect(res.statusCode).toBe(401);

    expect(driver.resolve('github').getAuthenticatedUser).toBeCalledWith({
      token: 'token',
    });

    expect(logger.warn).toBeCalledWith(e, expect.stringContaining('failed'));

    expect(handler).not.toBeCalled();
  });

  test('valid token', async () => {
    const driver = createDriverRegistryMock().provideValue(
      'github',
      createGhClientMock({
        getAuthenticatedUser: jest.fn().mockResolvedValueOnce('user'),
      }),
    );

    const server = await setup(driver);

    let ghUser: FastifyRequest['ghUser'];
    let ghToken: FastifyRequest['ghToken'];
    server.get('/', (request, reply) => {
      ghUser = request.ghUser;
      ghToken = request.ghToken;
      reply.send();
    });

    const res = await server.inject({
      method: 'GET',
      url: '/',
      headers: {
        Authorization: 'github token',
      },
    });

    expect(res.statusCode).toBe(200);

    expect(driver.resolve('github').getAuthenticatedUser).toBeCalledWith({
      token: 'token',
    });

    expect(ghUser!).toBe('user');
    expect(ghToken!).toBe('token');
  });
});
