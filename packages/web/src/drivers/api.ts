import ky, { HTTPError } from 'ky';
import type {
  PostAppTokenRequest,
  PostAppTokenResponse,
  PostAuthRequest,
  PostAuthSuccessResponse,
} from '@acot/gh-app-shared';
import { API_URL } from '../constants';

export type ApiClient = {
  login: (request: PostAuthRequest) => Promise<PostAuthSuccessResponse>;
  generateAppToken: (
    request: PostAppTokenRequest & {
      token: string;
    },
  ) => Promise<PostAppTokenResponse>;
};

export const createApiClient = (): ApiClient => {
  const client = ky.extend({
    prefixUrl: API_URL,
  });

  const auth = (token: string, type: 'Bearer' | 'github' = 'Bearer') => ({
    Authorization: `${type} ${token}`,
  });

  const wrap = async <T>(fn: () => Promise<T>): Promise<T> => {
    try {
      return await fn();
    } catch (e) {
      if (e instanceof HTTPError) {
        return await e.response.json();
      }
      throw e;
    }
  };

  return {
    login: async (request) => {
      return await wrap(() =>
        client
          .post('auth', {
            json: request,
          })
          .json(),
      );
    },

    generateAppToken: async ({ token, ...rest }) => {
      return await wrap(() =>
        client
          .post('app/token', {
            json: rest,
            headers: auth(token, 'github'),
          })
          .json(),
      );
    },
  };
};
