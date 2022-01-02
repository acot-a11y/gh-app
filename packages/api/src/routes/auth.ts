import type { PostAuthRequest, PostAuthResponse } from '@acot/gh-app-shared';
import { PostAuthRequestSchema } from '@acot/gh-app-shared';
import type { Route } from './types';

export const postAuthRoute: Route<{
  Body: PostAuthRequest;
  Reply: PostAuthResponse;
}> = {
  method: 'POST',
  url: '/auth',
  schema: {
    body: PostAuthRequestSchema,
  },
  handler: async (request, reply) => {
    request.logger.debug({ body: request.body }, 'receive authentication code');

    const { code } = request.body;

    const output = await request.service.resolve('auth').loginAsUser({
      now: new Date(),
      code,
    });

    reply.code(output.ok ? 200 : 401).send(output.data);
  },
};
