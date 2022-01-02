import fp from 'fastify-plugin';

declare module 'fastify' {
  /* eslint-disable-next-line @typescript-eslint/consistent-type-definitions */
  interface FastifyRequest<RouteGeneric, RawServer, RawRequest> {
    app: {
      installation_id: number;
      owner: string;
      repo: string;
    } | null;
  }
}

export const appAuthPlugin = fp(async (app) => {
  app.decorateRequest('app', null);

  app.addHook('preHandler', (request, reply, done) => {
    const auth = request.headers.authorization;
    if (auth == null) {
      return reply.code(401).send();
    }

    const [type, token] = auth.split(' ');
    if (type !== 'Bearer') {
      return reply.code(400).send();
    }

    request.service
      .resolve('app')
      .verifyToken({ token })
      .then((output) => {
        if (!output.ok) {
          request.logger.warn(output.data, 'failed app-auth');
          return reply.code(401).send();
        }

        request.app = {
          installation_id: output.data.installation_id,
          owner: output.data.owner,
          repo: output.data.repo,
        };

        return done();
      })
      .catch((e) => {
        request.logger.error(e, 'An error occurred AppService.verifyToken');
        reply.code(500).send();
      });

    return;
  });
});
