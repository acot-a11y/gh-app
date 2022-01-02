import type {
  PostPrCommentRequest,
  PostPrCommentResponse,
} from '@acot/gh-app-types';
import { PostPrCommentRequestSchema } from '@acot/gh-app-types';
import type { Route } from '../types';

export const postPrCommentRoute: Route<{
  Body: PostPrCommentRequest;
  Reply: PostPrCommentResponse;
}> = {
  method: 'POST',
  url: '/comment',
  schema: {
    body: PostPrCommentRequestSchema,
  },
  handler: async (request, reply) => {
    request.logger.debug({ body: request.body }, 'receive PR comment');

    const { number, meta, summary } = request.body;
    const { installation_id, owner, repo } = request.app!;

    const loginOutput = await request.service.resolve('auth').loginAsApp({
      now: new Date(),
      installation_id,
    });

    if (!loginOutput.ok) {
      return reply.code(404).send(loginOutput.data);
    }

    const commentOutput = await request.service.resolve('notify').comment({
      token: loginOutput.data.token,
      owner,
      repo,
      number,
      meta,
      summary,
    });

    return reply.code(commentOutput.ok ? 200 : 400).send(commentOutput.data);
  },
};
