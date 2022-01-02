import fp from 'fastify-plugin';
import type { GhUser } from '../drivers/github';
import type { DriverRegistry } from '../drivers/registry';

declare module 'fastify' {
  /* eslint-disable-next-line @typescript-eslint/consistent-type-definitions */
  interface FastifyRequest<RouteGeneric, RawServer, RawRequest> {
    ghUser: GhUser | null;
    ghToken: string | null;
  }
}

export type GhAuthPluginOptions = {
  driver: DriverRegistry;
};

export const ghAuthPlugin = fp<GhAuthPluginOptions>(async (app, { driver }) => {
  app.decorateRequest('ghUser', null);
  app.decorateRequest('ghToken', null);

  app.addHook('preHandler', (request, reply, done) => {
    const auth = request.headers.authorization;
    if (auth == null) {
      return reply.code(401).send();
    }

    const [type, token] = auth.split(' ');
    if (type !== 'github') {
      return reply.code(400).send();
    }

    driver
      .resolve('github')
      .getAuthenticatedUser({ token })
      .then((user) => {
        request.ghUser = user;
        request.ghToken = token;
        done();
      })
      .catch((e) => {
        request.logger.warn(e, 'failed get authenticated user');
        reply.code(401).send();
      });

    return;
  });
});
