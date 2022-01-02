import jwt from 'jsonwebtoken';
import {
  GH_APP_CLIENT_ID,
  GH_APP_CLIENT_SECRET,
  GH_APP_ID,
  GH_APP_PEM,
  GH_APP_REDIRECT_URI,
} from '../constants';
import type { DriverRegistry } from '../drivers/registry';
import type { Logger } from '../logging';
import type { ServiceOutput } from './utils';
import { output } from './utils';

// loginAsUser
export type AuthLoginAsUserInput = {
  now: Date;
  code: string;
};

export type AuthLoginAsUserOutput = ServiceOutput<
  {
    token: string;
    expires_at: number;
  },
  {
    error: string;
    help?: string;
  }
>;

// loginAsApp
export type AuthLoginAsAppInput = {
  now: Date;
  installation_id: number;
};

export type AuthLoginAsAppOutput = ServiceOutput<
  {
    token: string;
    expires_at: number;
  },
  {
    error: string;
  }
>;

export type AuthService = {
  loginAsUser: (input: AuthLoginAsUserInput) => Promise<AuthLoginAsUserOutput>;
  loginAsApp: (input: AuthLoginAsAppInput) => Promise<AuthLoginAsAppOutput>;
};

export const createAuthService = (
  logger: Logger,
  driver: DriverRegistry,
): AuthService => {
  const github = driver.resolve('github');

  return {
    loginAsUser: async ({ now, code }) => {
      try {
        const data = await github.exchangeCodeForToken({
          client_id: GH_APP_CLIENT_ID,
          client_secret: GH_APP_CLIENT_SECRET,
          redirect_uri: GH_APP_REDIRECT_URI,
          code,
        });

        if ('access_token' in data) {
          return output(true, {
            token: data.access_token,
            expires_at: now.getTime() + data.expires_in,
          });
        } else {
          return output(false, {
            error: `${data.error_description} (${data.error})`,
            help: data.error_uri,
          });
        }
      } catch (e) {
        logger.error(e, 'loginAsUser failure');
        return output(false, {
          error: e instanceof Error ? e.message : '',
        });
      }
    },

    loginAsApp: async ({ now, installation_id }) => {
      try {
        const ms = Math.floor(now.getTime() / 1000);
        const token = jwt.sign(
          {
            iat: ms - 60,
            exp: ms + 10 * 60, // 10 miniutes
            iss: GH_APP_ID,
          },
          GH_APP_PEM,
          {
            algorithm: 'RS256',
          },
        );

        const data = await github.createInstallationAccessToken({
          token,
          installation_id,
        });

        return output(true, {
          token: data.token,
          expires_at: new Date(data.expires_at).getTime(),
        });
      } catch (e) {
        logger.error(e, 'loginAsApp failure');
        return output(false, {
          error: e instanceof Error ? e.message : '',
        });
      }
    },
  };
};

createAuthService.inject = ['logger', 'driver'] as const;
