import type {
  PostAppTokenRequest,
  PostAppTokenResponse,
} from '@acot/gh-app-shared';
import { PostAppTokenRequestSchema } from '@acot/gh-app-shared';
import type { Route } from '../types';

export const postAppTokenRoute: Route<{
  Body: PostAppTokenRequest;
  Reply: PostAppTokenResponse;
}> = {
  method: 'POST',
  url: '/token',
  schema: {
    body: PostAppTokenRequestSchema,
  },
  handler: async (request, reply) => {
    request.logger.debug({ body: request.body }, 'receive generate app token');

    const { installation_id, owner, repo } = request.body;

    const output = await request.service.resolve('app').generateToken({
      ghToken: request.ghToken!,
      installation_id,
      owner,
      repo,
    });

    reply.code(output.ok ? 200 : 401).send(output.data);
  },
};
