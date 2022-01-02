import { createSummary } from '@acot/factory';
import fastify from 'fastify';
import type { ServiceRegistry } from '../../../services/registry';
import { output } from '../../../services/utils';
import { createAuthServiceMock } from '../../../services/__mocks__/auth';
import { createNotifyServiceMock } from '../../../services/__mocks__/notify';
import { createServiceRegistryMock } from '../../../services/__mocks__/registry';
import { postPrCommentRoute } from '../comment';

describe('routes - pr/comment', () => {
  const setup = (service: ServiceRegistry) =>
    fastify()
      .route(postPrCommentRoute)
      .decorateRequest('app', {
        getter: () => ({
          installation_id: 12345,
          owner: 'owner',
          repo: 'repo',
        }),
      })
      .decorateRequest('logger', { getter: () => service.resolve('logger') })
      .decorateRequest('service', { getter: () => service });

  describe('post', () => {
    const payload = {
      number: 123,
      meta: {
        core: {
          version: '0.0.0',
        },
        runner: {
          name: 'runner',
          version: '0.0.0',
        },
        commit: 'commit',
        origin: 'origin',
      },
      summary: createSummary({}),
    };

    test('success', async () => {
      const service = createServiceRegistryMock()
        .provideValue(
          'auth',
          createAuthServiceMock({
            loginAsApp: jest.fn().mockResolvedValueOnce(
              output(true, {
                token: 'token',
              }),
            ),
          }),
        )
        .provideValue(
          'notify',
          createNotifyServiceMock({
            comment: jest.fn().mockResolvedValueOnce(output(true, 'ok')),
          }),
        );

      const server = setup(service);

      const response = await server.inject({
        method: 'POST',
        url: '/comment',
        payload,
      });

      expect(service.resolve('auth').loginAsApp).toBeCalledWith(
        expect.objectContaining({
          installation_id: 12345,
        }),
      );

      expect(service.resolve('notify').comment).toBeCalledWith({
        token: 'token',
        owner: 'owner',
        repo: 'repo',
        ...payload,
      });

      expect(response.statusCode).toBe(200);
      expect(response.payload).toBe('ok');
    });

    test('failure - not found', async () => {
      const service = createServiceRegistryMock().provideValue(
        'auth',
        createAuthServiceMock({
          loginAsApp: jest.fn().mockResolvedValueOnce(output(false, 'ng')),
        }),
      );

      const server = setup(service);

      const response = await server.inject({
        method: 'POST',
        url: '/comment',
        payload,
      });

      expect(service.resolve('auth').loginAsApp).toBeCalledWith(
        expect.objectContaining({
          installation_id: 12345,
        }),
      );

      expect(service.resolve('notify').comment).not.toBeCalled();

      expect(response.statusCode).toBe(404);
      expect(response.payload).toBe('ng');
    });

    test('failure - invalid body', async () => {
      const service = createServiceRegistryMock()
        .provideValue(
          'auth',
          createAuthServiceMock({
            loginAsApp: jest.fn().mockResolvedValueOnce(
              output(true, {
                token: 'token',
              }),
            ),
          }),
        )
        .provideValue(
          'notify',
          createNotifyServiceMock({
            comment: jest.fn().mockResolvedValueOnce(output(false, 'ng')),
          }),
        );

      const server = setup(service);

      const response = await server.inject({
        method: 'POST',
        url: '/comment',
        payload,
      });

      expect(response.statusCode).toBe(400);
      expect(response.payload).toBe('ng');
    });

    test.each([
      {},
      {
        number: payload.number,
      },
      {
        meta: payload.meta,
      },
      {
        summary: payload.summary,
      },
      {
        ...payload,
        number: 'string',
      },
    ])('failure - bad request (%p)', async (invalidPayload) => {
      const service = createServiceRegistryMock();
      const server = setup(service);

      const response = await server.inject({
        method: 'POST',
        url: '/comment',
        payload: invalidPayload,
      });

      expect(service.resolve('auth').loginAsApp).not.toBeCalled();
      expect(service.resolve('notify').comment).not.toBeCalled();

      expect(response.statusCode).toBe(400);
    });
  });
});
