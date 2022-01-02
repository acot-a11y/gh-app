import fastify from 'fastify';
import type { ServiceRegistry } from '../../services/registry';
import { output } from '../../services/utils';
import { createAuthServiceMock } from '../../services/__mocks__/auth';
import { createServiceRegistryMock } from '../../services/__mocks__/registry';
import { postAuthRoute } from '../auth';

describe('routes - auth', () => {
  const setup = (service: ServiceRegistry) =>
    fastify()
      .route(postAuthRoute)
      .decorateRequest('logger', { getter: () => service.resolve('logger') })
      .decorateRequest('service', { getter: () => service });

  describe('post', () => {
    test('success', async () => {
      const service = createServiceRegistryMock().provideValue(
        'auth',
        createAuthServiceMock({
          loginAsUser: jest.fn().mockResolvedValueOnce(output(true, 'ok')),
        }),
      );

      const server = setup(service);

      const response = await server.inject({
        method: 'POST',
        url: '/auth',
        payload: {
          code: 'code',
        },
      });

      expect(service.resolve('auth').loginAsUser).toBeCalledWith(
        expect.objectContaining({
          code: 'code',
        }),
      );

      expect(response.statusCode).toBe(200);
      expect(response.payload).toBe('ok');
    });

    test('failure - invalid body', async () => {
      const service = createServiceRegistryMock().provideValue(
        'auth',
        createAuthServiceMock({
          loginAsUser: jest.fn().mockResolvedValueOnce(output(false, 'ng')),
        }),
      );

      const server = setup(service);

      const response = await server.inject({
        method: 'POST',
        url: '/auth',
        payload: {
          code: 'invalid',
        },
      });

      expect(response.statusCode).toBe(401);
      expect(response.payload).toBe('ng');
    });

    test.each([
      {},
      {
        code: {},
      },
    ])('failure - bad request (%p)', async (payload) => {
      const service = createServiceRegistryMock();
      const server = setup(service);

      const response = await server.inject({
        method: 'POST',
        url: '/auth',
        payload,
      });

      expect(service.resolve('auth').loginAsUser).not.toHaveBeenCalled();

      expect(response.statusCode).toBe(400);
    });
  });
});
