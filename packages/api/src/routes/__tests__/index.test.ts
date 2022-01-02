import fastify from 'fastify';
import { getIndexRoute } from '..';
import { createLoggerMock } from '../../__mocks__/logging';

describe('routes - index', () => {
  const setup = () =>
    fastify()
      .route(getIndexRoute)
      .decorateRequest('logger', { getter: () => createLoggerMock() });

  describe('get', () => {
    test('success', async () => {
      const server = setup();

      const response = await server.inject({
        method: 'GET',
        url: '/',
        payload: {},
      });

      expect(response.statusCode).toBe(200);
    });
  });
});
