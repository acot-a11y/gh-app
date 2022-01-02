import type { RouteOptions } from 'fastify';

export const getIndexRoute: RouteOptions = {
  method: 'GET',
  url: '/',
  handler: async (request, reply) => {
    request.logger.debug('alive');
    reply.send();
  },
};
