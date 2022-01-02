import type { Merge } from 'type-fest';
import type { DatastorePath } from '../drivers/datastore';
import type { DriverRegistry } from '../drivers/registry';
import type { Logger } from '../logging';
import type { ServiceOutput } from './utils';
import { output } from './utils';

export type AppRepositoryEntity = {
  installation_id: number;
  owner: string;
  repo: string;
};

// generateToken
export type AppGenerateTokenInput = Merge<
  AppRepositoryEntity,
  {
    ghToken: string;
  }
>;

export type AppGenerateTokenOutput = ServiceOutput<
  {
    token: string;
  },
  {
    error: string;
  }
>;

// verifyToken
export type AppVerifyTokenInput = {
  token: string;
};

export type AppVerifyTokenOutput = ServiceOutput<
  AppRepositoryEntity,
  {
    error: string;
  }
>;

// revokeToken
export type AppRevokeTokenInput = {
  token: string;
};

export type AppRevokeTokenOutput = ServiceOutput<
  {
    ok: true;
  },
  {
    error: string;
  }
>;

export type AppService = {
  generateToken: (
    input: AppGenerateTokenInput,
  ) => Promise<AppGenerateTokenOutput>;
  verifyToken: (input: AppVerifyTokenInput) => Promise<AppVerifyTokenOutput>;
  revokeToken: (input: AppRevokeTokenInput) => Promise<AppRevokeTokenOutput>;
};

export const createAppService = (
  logger: Logger,
  driver: DriverRegistry,
): AppService => {
  const crypto = driver.resolve('crypto');
  const datastore = driver.resolve('datastore');
  const github = driver.resolve('github');

  const isNotNullish = (input: unknown): input is Record<string, unknown> =>
    input != null;

  const isEntity = (input: unknown): input is AppRepositoryEntity => {
    if (!isNotNullish(input)) {
      return false;
    }
    return (
      typeof input.installation_id === 'number' &&
      typeof input.owner === 'string' &&
      typeof input.repo === 'string'
    );
  };

  const createPath = (entity: AppRepositoryEntity): DatastorePath => [
    'repositories',
    [entity.owner, entity.repo].join(','),
  ];

  return {
    generateToken: async ({ ghToken, ...input }) => {
      try {
        // check permission
        const { repositories } = await github.getRepositoryListByInstallationId(
          {
            token: ghToken,
            installation_id: input.installation_id,
            per_page: 100,
            page: 1,
          },
        );

        const hasRepository = repositories.some((r) => r.name === input.repo);
        if (!hasRepository) {
          return output(false, {
            error: 'repository does not found',
          });
        }

        // generate app token
        const token = crypto.encrypt(JSON.stringify(input));

        await datastore.save(createPath(input), {
          token,
        });

        return output(true, {
          token,
        });
      } catch (e) {
        logger.error(e, 'failed generate token');
        return output(false, {
          error: e instanceof Error ? e.message : 'failed generate token',
        });
      }
    },

    verifyToken: async ({ token }) => {
      try {
        const data: unknown = JSON.parse(crypto.decrypt(token));
        if (!isEntity(data)) {
          return output(false, { error: 'token is broken' });
        }

        const stored = await datastore.get<{ token: string }>(createPath(data));
        if (stored.token !== token) {
          return output(false, { error: 'invalid token' });
        }

        return output(true, data);
      } catch (e) {
        logger.error(e, 'failed decode token');
        return output(false, {
          error: e instanceof Error ? e.message : 'failed decode token',
        });
      }
    },

    revokeToken: async ({ token }) => {
      try {
        const data: unknown = JSON.parse(crypto.decrypt(token));
        if (!isEntity(data)) {
          return output(false, { error: 'token is broken' });
        }

        await datastore.delete(createPath(data));

        return output(true, { ok: true });
      } catch (e) {
        logger.error(e, 'failed revoke token');
        return output(false, {
          error: e instanceof Error ? e.message : 'failed revoke token',
        });
      }
    },
  };
};

createAppService.inject = ['logger', 'driver'] as const;
