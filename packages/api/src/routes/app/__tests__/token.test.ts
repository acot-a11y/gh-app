import fastify from 'fastify';
import type { ServiceRegistry } from '../../../services/registry';
import { output } from '../../../services/utils';
import { createAppServiceMock } from '../../../services/__mocks__/app';
import { createServiceRegistryMock } from '../../../services/__mocks__/registry';
import { postAppTokenRoute } from '../token';

describe('routes - app/token', () => {
  const setup = (service: ServiceRegistry) =>
    fastify()
      .route(postAppTokenRoute)
      .decorateRequest('logger', { getter: () => service.resolve('logger') })
      .decorateRequest('service', { getter: () => service });

  describe('post', () => {
    test('success', async () => {
      const service = createServiceRegistryMock().provideValue(
        'app',
        createAppServiceMock({
          generateToken: jest.fn().mockResolvedValueOnce(output(true, 'ok')),
        }),
      );

      const server = setup(service);

      const payload = {
        installation_id: 12345,
        owner: 'owner',
        repo: 'repo',
      };

      const response = await server.inject({
        method: 'POST',
        url: '/token',
        payload,
      });

      expect(service.resolve('app').generateToken).toBeCalledWith(
        expect.objectContaining(payload),
      );

      expect(response.statusCode).toBe(200);
      expect(response.payload).toBe('ok');
    });

    test('failure - invalid body', async () => {
      const service = createServiceRegistryMock().provideValue(
        'app',
        createAppServiceMock({
          generateToken: jest.fn().mockResolvedValueOnce(output(false, 'ng')),
        }),
      );

      const server = setup(service);

      const payload = {
        installation_id: 12345,
        owner: 'owner',
        repo: 'repo',
      };

      const response = await server.inject({
        method: 'POST',
        url: '/token',
        payload,
      });

      expect(response.statusCode).toBe(401);
      expect(response.payload).toBe('ng');
    });

    test.each([
      {},
      {
        installation_id: 'string',
        owner: 'owner',
        repo: 'repo',
      },
      {
        installation_id: 12345,
        owner: {},
        repo: {},
      },
    ])('failure - bad request (%p)', async (payload) => {
      const service = createServiceRegistryMock().provideValue(
        'app',
        createAppServiceMock({
          generateToken: jest.fn().mockResolvedValueOnce(output(true, 'ok')),
        }),
      );

      const server = setup(service);

      const response = await server.inject({
        method: 'POST',
        url: '/token',
        payload,
      });

      expect(service.resolve('app').generateToken).not.toHaveBeenCalled();

      expect(response.statusCode).toBe(400);
    });
  });
});
