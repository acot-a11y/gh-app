import type { FastifyInstance } from 'fastify';
import fastify from 'fastify';
import cors from 'fastify-cors';
import type { DriverRegistry } from './drivers/registry';
import { appAuthPlugin } from './plugins/app-auth';
import { ghAuthPlugin } from './plugins/gh-auth';
import { dependencyInjectionPlugin } from './plugins/dependency-injection';
import { getIndexRoute } from './routes';
import { postAppTokenRoute } from './routes/app/token';
import { postAuthRoute } from './routes/auth';
import { postPrCommentRoute } from './routes/pr/comment';

export const createServer = async (
  driver: DriverRegistry,
): Promise<FastifyInstance> => {
  const server = fastify({
    logger: false,
    trustProxy: true,
  });

  /**
   * Set plugins
   */
  server.register(dependencyInjectionPlugin, {
    driver,
  });

  server.register(cors, {
    origin: ['http://localhost:3000', 'https://gh-app.acot.dev'],
  });

  await server.after();

  /**
   * Set routes
   */
  server.route(getIndexRoute);
  server.route(postAuthRoute);

  await server.register(
    async (instance) => {
      instance.register(ghAuthPlugin, { driver });
      await instance.after();
      instance.route(postAppTokenRoute);
    },
    { prefix: '/app' },
  );

  await server.register(
    async (instance) => {
      instance.register(appAuthPlugin);
      await instance.after();
      instance.route(postPrCommentRoute);
    },
    { prefix: '/pr' },
  );

  /**
   * Set error handler
   */
  server.setErrorHandler((error, request, reply) => {
    request.logger.error(error);
    reply.code(error.statusCode ?? 500).send();
  });

  return server;
};
